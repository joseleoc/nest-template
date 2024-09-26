import { faker } from '@faker-js/faker';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export const UsersServiceMock = {
  findUserById: jest.fn().mockImplementation(
    (id: string): Promise<User> =>
      new Promise((resolve) =>
        resolve({
          userId: id,
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
      (id: string, updateUserDto: UpdateUserDto): Promise<User> => {
        return new Promise((resolve) =>
          resolve({
            userId: id,
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
};
