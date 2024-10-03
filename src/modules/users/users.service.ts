import { Model } from 'mongoose';
import { genSalt, hashSync } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { PublicUser } from './types/users.types';
import { User, UserDocument } from './schemas/user.schema';
import { PlanNames } from '../plans/schemas/plan.schema';

@Injectable()
export class UsersService {
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private configService: ConfigService,
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
        this.userModel
          .findOneAndUpdate(
            { email: createUserDto.email, deleted: true },
            { userName: createUserDto.userName, deleted: false },
            { new: true },
          )
          .then((foundUser: UserDocument | null) => {
            if (foundUser == null) {
              this.userModel
                .create(createUserDto)
                .then((res) => {
                  const user = new PublicUser(res);

                  resolve(user);
                })
                .catch((error) => {
                  reject(error);
                });
            } else {
              resolve(foundUser);
            }
          })
          .then()
          .catch((error) => reject(error));
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

  findOneByUserName(userName: string): Promise<PublicUser> {
    return new Promise((resolve: (value: PublicUser) => void, reject) => {
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
          const updatedUser = res.toObject();
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

  canCreateStory(user: User): Promise<boolean> {
    return new Promise((resolve) => {
      if (user != null && user.deleted === false) {
        const maxStories = this.checkPlanLimit(user.plan);
        if (maxStories >= user.credits) {
          resolve(true);
          return;
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }

  // --------------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------------
  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(+this.configService.getOrThrow('APP_SALT'));
    return hashSync(password, salt);
  }

  private checkPlanLimit(userPlan: PlanNames): number {
    switch (userPlan) {
      case PlanNames.MAGIC_TALES:
        return 5;
      case PlanNames.AMAZING_STORIES:
        return 15;
      case PlanNames.UNLIMITED_WORLDS:
        return Number.POSITIVE_INFINITY;
      default:
        return 0;
    }
  }
}
