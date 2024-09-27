import { genSalt, hashSync } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User, UserDocument, UserSchemaName } from './schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserSchemaName) private readonly userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  create(createUserDto: CreateUserDto): Promise<{ userId: string }> {
    return new Promise(
      async (resolve: (value: { userId: string }) => void, reject) => {
        try {
          createUserDto.password = await this.hashPassword(
            createUserDto.password,
          );
          this.userModel
            .create(createUserDto)
            .then((res) => {
              resolve({ userId: res.id });
            })
            .catch((error) => {
              reject(error);
            });
        } catch (error) {
          reject(error);
        }
      },
    );
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  findOne(id: string): Promise<UserDocument> {
    return new Promise((resolve: (value: UserDocument) => void, reject) => {
      this.userModel
        .findById(id)
        .then((user) => {
          resolve(user);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  findOneByUserName(userName: string): Promise<UserDocument> {
    return new Promise((resolve: (value: UserDocument) => void, reject) => {
      this.userModel
        .findOne({ userName })
        .then((user) => {
          resolve(user);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return new Promise((resolve: (value: User) => void, reject) => {
      this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .then((res) => {
          const updatedUser = res.$clone();
          resolve(updatedUser);
        })
        .catch((error) => reject(error));
    });
  }

  remove(id: string): Promise<User> {
    return new Promise((resolve: (value: User) => void, reject) => {
      this.userModel
        .findByIdAndDelete(id)
        .then((res) => {
          const deletedUser = res.$clone();
          resolve(deletedUser);
        })
        .catch((error) => reject(error));
    });
    // return `This action removes a #${id} user`;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(+this.configService.getOrThrow('APP_SALT'));
    return hashSync(password, salt);
  }
}
