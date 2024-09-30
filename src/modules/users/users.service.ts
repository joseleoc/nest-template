import { genSalt, hashSync } from 'bcrypt';
import { HttpCode, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User } from './schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { PublicUser } from './types/users.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  create(createUserDto: CreateUserDto): Promise<PublicUser> {
    return new Promise(async (resolve: (value: PublicUser) => void, reject) => {
      try {
        createUserDto.password = await this.hashPassword(
          createUserDto.password,
        );
        this.userModel
          .create(createUserDto)
          .then((res) => {
            const user = new PublicUser(res);

            resolve(user);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  findOne(id: string): Promise<PublicUser> {
    return new Promise((resolve: (value: PublicUser) => void, reject) => {
      this.userModel
        .findById(id)
        .then((user) => {
          if (user != null) {
            const foundUser = new PublicUser(user);
            resolve(foundUser);
          } else {
            reject({ message: 'User not found', code: HttpStatus.NOT_FOUND });
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
          const foundUser = new PublicUser(user);
          resolve(foundUser);
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
