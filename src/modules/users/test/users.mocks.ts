/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export const UsersServiceMock = {
  findUserById: jest.fn().mockImplementation(
    (id: string): Promise<any> =>
      new Promise((resolve) =>
        resolve({
          userName: faker.person.firstName(),
          password: faker.internet.password(),
        }),
      ),
  ),
  create: jest
    .fn()
    .mockImplementation(
      (createUserDto: CreateUserDto): Promise<{ userId: string }> => {
        return new Promise((resolve) =>
          resolve({
            userId: faker.string.uuid(),
          }),
        );
      },
    ),
  update: jest
    .fn()
    .mockImplementation(
      (id: string, updateUserDto: UpdateUserDto): Promise<any> => {
        return new Promise((resolve) =>
          resolve({
            userName: updateUserDto.userName,
            password: updateUserDto.password,
          }),
        );
      },
    ),
  remove: jest
    .fn()
    .mockImplementation(
      (id: string): Promise<boolean> => new Promise((resolve) => resolve(true)),
    ),
  findUserByUserName: jest
    .fn()
    .mockImplementation((userName: string): Promise<any> => {
      return new Promise((resolve) =>
        resolve({
          userName: userName,
          password: faker.internet.password(),
        }),
      );
    }),
};
