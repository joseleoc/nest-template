import { genSalt, hashSync } from 'bcrypt';
import { Injectable } from '@nestjs/common';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { faker } from '@faker-js/faker';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      userId: '1',
      userName: 'john',
      password: 'changeme',
    },
    {
      userId: '2',
      userName: 'maria',
      password: 'guess',
    },
  ];

  constructor() {}

  create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    return new Promise(
      async (resolve: (value: Omit<User, 'password'>) => void, reject) => {
        createUserDto.password = await this.hashPassword(
          createUserDto.password,
        );
        console.log(createUserDto.password);
        const user = {
          userId: faker.string.uuid(),
          userName: createUserDto.userName,
        };
        resolve(user);
        reject('Not implemented');
      },
    );
  }

  findAll() {
    return `This action returns all users`;
  }

  findUserById(id: string): Promise<User> {
    return new Promise((resolve: (value: User) => void, reject) => {
      const user = this.users.find((user) => user.userName === id);

      resolve(user);
    });
  }

  findUserByUserName(userName: string): Promise<User> {
    return new Promise((resolve: (value: User) => void, reject) => {
      const user = this.users.find((user) => user.userName === userName);

      resolve(user);
    });
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return new Promise((resolve: (value: User) => void, reject) => {
      const user = this.users.find((user) => user.userId === id);
      if (user) {
        user.userName = updateUserDto.userName;
        user.password = updateUserDto.password;
        resolve(user);
      } else {
        reject({ code: 404, message: 'User not found' });
      }
    });
  }

  remove(id: string): Promise<boolean> {
    return new Promise((resolve: (value: boolean) => void, reject) => {
      const user = this.users.find((user) => user.userId === id);
      if (user) {
        this.users = this.users.filter((user) => user.userId !== id);
        resolve(true);
      } else {
        reject({ code: 404, message: 'User not found' });
      }
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(+process.env.APP_SALT);
    return hashSync(password, salt);
  }
}
