import { Model } from 'mongoose';
import { genSalt, hash } from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { PlansService } from '@/modules/plans/plans.service';

import { Language } from '@/general.types';
import { User, UserDocument } from './schemas/user.schema';
import { PlanNames } from '@/modules/plans/schemas/plan.schema';
import { ChangePasswordParams, PublicUser } from './types/users.types';
import { UtilsService } from '@/services/utils/utils.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { PaymentsService } from '../payments/payments.service';

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
    private configService: ConfigService,
    private plansService: PlansService,
    private utilsService: UtilsService,
    private paymentsService: PaymentsService,
  ) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  create(createUserDto: CreateUserDto): Promise<PublicUser> {
    return new Promise(async (resolve: (value: PublicUser) => void, reject) => {
      try {
        createUserDto.password = await this.hashPassword(
          createUserDto.password,
        );
        const planNames = Object.values(PlanNames);
        if (!planNames.includes(createUserDto.plan)) {
          reject({
            message: 'Plan not found',
            code: HttpStatus.NOT_FOUND,
          });
          return;
        }
        this.plansService
          .findPlanByName(createUserDto.plan)
          .then((plan) => {
            if (plan != null) {
              this.userModel
                .findOneAndUpdate(
                  { email: createUserDto.email, deleted: true },
                  { userName: createUserDto.userName, deleted: false },
                  { new: true },
                )
                .then((foundUser: UserDocument | null) => {
                  if (foundUser == null) {
                    const userToCreate: User = {
                      credits: plan.creditsLimit,
                      ...createUserDto,
                      deleted: false,
                      language: createUserDto.language || Language.EN,
                    };
                    return this.userModel
                      .create(userToCreate)
                      .then((userDoc) => new PublicUser(userDoc));
                  } else {
                    return new PublicUser(foundUser);
                    // resolve(new PublicUser(foundUser));
                  }
                })
                .then((user) => {
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
                      message: 'Error handling the user',
                      code: HttpStatus.INTERNAL_SERVER_ERROR,
                    });
                    return;
                  }
                  resolve(new PublicUser(userWithCustomer));
                })
                .catch((error) => {
                  this.logger.error(error);
                  reject({
                    message: 'Error handling the user',
                    error,
                    code: HttpStatus.CONFLICT,
                  });
                });
            } else {
              reject({
                message: 'Plan not found',
                code: HttpStatus.NOT_FOUND,
              });
            }
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
        .findOne({ userName })
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
  updateCredits(id: string, credits: number): Promise<User | null> {
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
  findUserAndCheckCredits(userId: string): Promise<{
    user: PublicUser | null;
    canCreateStory: boolean;
    canAddAudio: boolean;
    canAddImage: boolean;
    canAddText: boolean;
  }> {
    return new Promise((resolve, reject) => {
      this.findOneById(userId)
        .then((user) => {
          if (user != null && user.deleted === false) {
            this.plansService.findPlanByName(user.plan).then((plan) => {
              const canAddAudio = plan?.accessToVoice ?? false;
              const canAddImage = plan?.accessToImage ?? false;
              const canAddText = plan?.accessToText ?? false;
              if (user.credits > 0) {
                resolve({
                  canCreateStory: true,
                  user: user,
                  canAddAudio,
                  canAddImage,
                  canAddText,
                });
                return;
              } else {
                resolve({
                  canCreateStory: false,
                  user: user,
                  canAddAudio: false,
                  canAddImage: false,
                  canAddText: false,
                });
              }
            });
          } else {
            resolve({
              canCreateStory: false,
              user: user,
              canAddAudio: false,
              canAddImage: false,
              canAddText: false,
            });
          }
        })
        .catch((error) =>
          reject({
            error,
            message: 'Error checking if the user can create a story',
          }),
        );
    });
  }

  changePassword({
    oldPassword,
    newPassword,
    userEmail,
  }: ChangePasswordParams) {
    return new Promise((resolve, reject) => {
      this.userModel
        .findOne({ email: userEmail })
        .then((user) => {
          if (user == null || user.deleted === true) {
            reject({
              message: 'User not found',
              code: HttpStatus.NOT_FOUND,
            });
            return;
          }
          if (oldPassword.length === 0 || newPassword.length === 0) {
            reject({
              message: 'Passwords cannot be empty',
              code: HttpStatus.BAD_REQUEST,
            });
            return;
          }
          const userPassword = user.password ?? '';
          return this.utilsService.validatePassword({
            strLiteral: oldPassword,
            userPassword,
          });
        })
        .then((isValid) => {
          if (isValid == false) {
            reject({
              message: 'User password is wrong',
              code: HttpStatus.UNAUTHORIZED,
            });
            return;
          }
          return this.hashPassword(newPassword);
        })
        .then((hashedPassword) => {
          return this.userModel.findOneAndUpdate(
            { email: userEmail },
            { password: hashedPassword },
          );
        })
        .then((updatedUser) => {
          if (updatedUser == null) {
            reject({
              message: 'User not found',
              code: HttpStatus.NOT_FOUND,
            });
          }
          if (updatedUser != null) resolve(new PublicUser(updatedUser));
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  forgotPassword(params: ForgotPasswordDto): Promise<PublicUser | null> {
    return new Promise((resolve, reject) => {
      const { password, email } = params;
      this.hashPassword(password)
        .then((hashedPassword) => {
          return this.userModel.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true },
          );
        })
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

  // --------------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------------
  private async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      genSalt(+this.configService.getOrThrow('APP_SALT'))
        .then((salt) => {
          return hash(password, salt);
        })
        .then((hashedPassword) => {
          resolve(hashedPassword);
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }
}
