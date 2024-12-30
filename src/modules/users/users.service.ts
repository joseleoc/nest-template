import { Model } from 'mongoose';
import { isNumber } from 'lodash';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { PlansService } from '@/modules/plans/plans.service';

import { Language } from '@/types/general.types';
import { User, UserDocument } from './schemas/user.schema';
import { PlanDocument, PlanNames } from '@/modules/plans/schemas/plan.schema';
import { PaymentsService } from '../payments/payments.service';
import { CheckUserCreditsResponse, PublicUser } from './types/users.types';

@Injectable()
export class UsersService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger();
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private plansService: PlansService,
    private paymentsService: PaymentsService,
  ) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  create(createUserDto: CreateUserDto): Promise<PublicUser> {
    return new Promise(async (resolve: (value: PublicUser) => void, reject) => {
      try {
        const planNames = Object.values(PlanNames);
        if (!planNames.includes(createUserDto.plan)) {
          // If the plan is not found, reject with a not found error
          reject({
            message: 'Plan not found',
            code: HttpStatus.NOT_FOUND,
          });
          return;
        }
        // Find the plan by the name
        this.plansService
          .findPlanByName(createUserDto.plan)
          .then((plan: PlanDocument) => {
            if (plan == null) {
              reject({
                message: 'Plan not found',
                code: HttpStatus.NOT_FOUND,
              });
              return;
            }

            this.userModel
              .findOneAndUpdate(
                { email: createUserDto.email, deleted: true },
                {
                  userName: createUserDto.userName,
                  deleted: false,
                  plan: plan.name,
                  planId: plan.id,
                },
                { new: true },
              )
              .then((foundUser: UserDocument | null) => {
                if (foundUser == null) {
                  const userToCreate: User = {
                    ...createUserDto,
                    _id: createUserDto.userId,
                    credits: isNumber(plan.creditsLimit)
                      ? plan.creditsLimit
                      : parseInt(plan.creditsLimit),
                    planId: plan.id,
                    deleted: false,
                    language: createUserDto.language || Language.EN,
                  };
                  return this.userModel
                    .create(userToCreate)
                    .then((userDoc) => new PublicUser(userDoc));
                } else {
                  return new PublicUser(foundUser);
                }
              })
              .then((user) => {
                // Creates the stripe customer and adds the customerId to the user
                return Promise.all([
                  this.paymentsService.createCustomer({
                    email: user.email,
                    name: user.userName,
                  }),
                  user,
                ]);
              })
              .then(([customer, user]) => {
                return this.userModel.findByIdAndUpdate(
                  user.id,
                  {
                    customerIds: [customer],
                  },
                  { new: true },
                );
              })
              .then((userWithCustomer) => {
                if (userWithCustomer == null) {
                  reject({
                    message: 'Error handling the user | Creating the customer',
                    code: HttpStatus.INTERNAL_SERVER_ERROR,
                  });
                  return;
                }
                resolve(new PublicUser(userWithCustomer));
              })
              .catch((error) => {
                this.logger.error(error);
                reject({
                  message:
                    error?.message ||
                    error?.err?.message ||
                    'Error handling the user',
                  error,
                  code: HttpStatus.CONFLICT,
                });
              });
          })
          .catch(() =>
            reject({
              message: 'Error setting the plan',
              code: HttpStatus.INTERNAL_SERVER_ERROR,
            }),
          );
      } catch (error) {
        reject(error);
      }
    });
  }

  findOneById(id: string): Promise<PublicUser | null> {
    return new Promise((resolve, reject) => {
      this.userModel
        .findOne({ _id: id, deleted: false })
        .then((user) => {
          if (user != null && user.deleted === false) {
            const foundUser = new PublicUser(user);
            resolve(foundUser);
          } else {
            resolve(null);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /** Returns a user document by its username */
  findUserDocumentByUserName(userName: string): Promise<UserDocument | null> {
    return new Promise((resolve, reject) => {
      this.userModel
        .findOne({
          $or: [
            { email: { $regex: new RegExp(`^${userName}$`, 'i') } },
            { userName: { $regex: new RegExp(`^${userName}$`, 'i') } },
          ],
        })
        .then((user) => {
          if (user != null && user.deleted === false) {
            resolve(user);
          } else resolve(null);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .then((res) => {
          if (res != null) {
            const updatedUser = new PublicUser(res);
            resolve(updatedUser);
          } else {
            resolve(null);
          }
        })
        .catch((error) => reject(error));
    });
  }

  /** Updates the credits of a user */
  updateCredits(
    id: string,
    credits: number | 'Infinity',
  ): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.userModel
        .findByIdAndUpdate(id, { credits: credits })
        .then((res) => {
          if (res != null) {
            const updatedUser = new PublicUser(res);
            resolve(updatedUser);
          } else {
            resolve(null);
          }
        })
        .catch((error) => reject(error));
    });
  }

  remove(id: string): Promise<{ id: string; deleted: boolean } | null> {
    return new Promise((resolve, reject) => {
      this.userModel
        .findByIdAndUpdate(id, { deleted: true })
        .then((res) => {
          if (res != null) {
            resolve({ id, deleted: true });
          } else {
            resolve(null);
          }
        })
        .catch((error) => reject(error));
    });
  }

  /**
   * Used to check if the user has enough credits to create a story
   * @param userId the user id to check
   * @returns a promise that resolves to an object with the user and a boolean indicating if the user can create a story
   */
  findUserAndCheckCredits(userId: string): Promise<CheckUserCreditsResponse> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.plansService.findSubscriptionByUserId(userId),
        this.findOneById(userId),
      ])
        .then(([subscription, user]) => {
          if (subscription != null && user != null && user.deleted === false) {
            this.plansService.findPlanByName(user.plan).then((plan) => {
              const canAddAudio = plan?.accessToVoice ?? false;
              const canAddImage = plan?.accessToImage ?? false;
              const canAddText = plan?.accessToText ?? false;

              let canCreateStory = false;

              const actualDate = new Date().getTime();
              // Check if the current date is after the subscription end date, if true, the user can't create a story
              if (actualDate > subscription.currentPeriodEnd) {
                canCreateStory = false;
              }

              if (user.credits > 0) {
                resolve({
                  canCreateStory,
                  user,
                  canAddAudio,
                  canAddImage,
                  canAddText,
                });
                return;
              } else {
                // The user can't create a story if the credits are 0
                resolve({
                  canCreateStory,
                  user,
                  canAddAudio: false,
                  canAddImage: false,
                  canAddText: false,
                });
              }
            });
          } else {
            resolve({
              // The user can't create a story if the subscription or the user are not found.
              canCreateStory: false,
              user: user,
              canAddAudio: false,
              canAddImage: false,
              canAddText: false,
            });
          }
        })
        .catch((error) => {
          this.logger.error({
            message: `Error finding subscription or user. UserId: ${userId}`,
            error,
          });
          reject({
            message: `Error finding subscription or user. UserId: ${userId}`,
            error,
          });
        });
    });
  }

  addCostumerIdToUser(params: {
    userId: string;
    customerId: string;
  }): Promise<PublicUser> {
    return new Promise((resolve, reject) => {
      this.userModel
        .findByIdAndUpdate(
          params.userId,
          {
            $push: { customerIds: params.customerId },
          },
          {
            new: true,
          },
        )
        .then((updatedUser) => {
          if (updatedUser == null) {
            reject({
              message: 'User not found',
              code: HttpStatus.NOT_FOUND,
            });
            return;
          }
          resolve(new PublicUser(updatedUser));
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }
}
