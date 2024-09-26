import { hashSync } from 'bcrypt';
import { Injectable } from '@nestjs/common';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

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

  create(createUserDto: CreateUserDto): Promise<{ userId: string }> {
    return new Promise(
      (resolve: (value: { userId: string }) => void, reject) => {
        createUserDto.password = hashSync(createUserDto.password, 10);
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
}
