import { Model } from 'mongoose';
import { genSalt, hashSync } from 'bcrypt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { PublicUser } from './types/users.types';
import { User, UserDocument } from './schemas/user.schema';
import { PlansService } from '../plans/plans.service';
import { PlanNames } from '../plans/schemas/plan.schema';
import { Language } from '@/general.types';

@Injectable()
export class UsersService {
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private configService: ConfigService,
    private plansService: PlansService,
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
                    this.userModel
                      .create(userToCreate)
                      .then((res) => {
                        const user = new PublicUser(res);

                        resolve(user);
                      })
                      .catch((error) => {
                        reject(error);
                      });
                  } else {
                    resolve(new PublicUser(foundUser));
                  }
                })
                .catch(() =>
                  reject({
                    message: 'Error handling the user',
                    code: HttpStatus.INTERNAL_SERVER_ERROR,
                  }),
                );
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

  findOneById(id: string): Promise<PublicUser> {
    return new Promise((resolve: (value: PublicUser) => void, reject) => {
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
  findUserDocumentByUserName(userName: string): Promise<UserDocument> {
    return new Promise((resolve: (value: UserDocument) => void, reject) => {
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
    return new Promise((resolve: (value: User) => void, reject) => {
      this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .then((res) => {
          const updatedUser = new PublicUser(res);
          resolve(updatedUser);
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
          const updatedUser = new PublicUser(res);
          resolve(updatedUser);
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
  findUserAndCheckCredits(
    userId: string,
  ): Promise<{ canCreateStory: boolean; user: PublicUser | null }> {
    return new Promise((resolve, reject) => {
      this.findOneById(userId)
        .then((user) => {
          if (user != null && user.deleted === false) {
            if (user.credits > 0) {
              resolve({ canCreateStory: true, user: user });
              return;
            } else {
              resolve({ canCreateStory: false, user: user });
            }
          } else {
            resolve({ canCreateStory: false, user: null });
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

  // --------------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------------
  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(+this.configService.getOrThrow('APP_SALT'));
    return hashSync(password, salt);
  }

  // private checkPlanLimit(userPlan: PlanNames): Promise<number> {
  //   return new Promise((resolve, reject) => {
  //     this.plansService
  //       .findAll()
  //       .then((plans) => {
  //         const plan = plans.find((plan) => plan.name === userPlan);
  //         console.log({ plan });
  //         if (plan != null) {
  //           resolve(plan.creditsLimit);
  //         } else {
  //           resolve(0);
  //         }
  //       })
  //       .catch((error) => reject(error));
  //   });
  // }
}
