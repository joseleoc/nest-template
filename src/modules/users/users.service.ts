import { v4 as uuid } from 'uuid';
import { Injectable, HttpStatus } from '@nestjs/common';

import { hashText } from '@/utils';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import createHttpError from 'http-errors';

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

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      createUserDto.password = await hashText(createUserDto.password);
      console.log(createUserDto.password);
      const user = {
        userId: uuid(),
        userName: createUserDto.userName,
      };
      return user;
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findUserById(id: string): Promise<User> {
    try {
      const user = this.users.find((user) => user.userName === id);
      if (!user) throw createHttpError(HttpStatus.NOT_FOUND, 'User not found');
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findUserByUserName(userName: string): Promise<User> {
    try {
      const user = this.users.find((user) => user.userName === userName);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = this.users.find((user) => user.userId === id);
      if (!user) {
        throw { code: 404, message: 'User not found' };
      }
      user.userName = updateUserDto.userName;
      user.password = updateUserDto.password;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const user = this.users.find((user) => user.userId === id);
      if (!user) throw { code: 404, message: 'User not found' };
      this.users = this.users.filter((user) => user.userId !== id);
      return true;
    } catch (error) {
      throw error;
    }
  }
}
