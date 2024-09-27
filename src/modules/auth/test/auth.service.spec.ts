import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersModule, UsersService } from '@/modules/users';
import { JwtService } from '@nestjs/jwt';
import { UsersServiceMock } from '@/modules/users/test/users.mocks';
import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '@/modules/users/schemas/user.schema';

describe('AuthService', () => {
  let service: AuthService;
  const noExistsUserName = 'noExist';
  beforeEach(async () => {
    process.env.JWT_SECRET = 'TODO: CHANGE TO A SECURE SECRET';
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockImplementation(() => 'token'),
          },
        },
        {
          provide: UsersService,
          useValue: {
            ...UsersServiceMock,
            findUserByUserName: jest
              .fn()
              .mockImplementation((userName: string) => {
                return new Promise((resolve, reject) => {
                  if (userName === noExistsUserName) reject(null);
                  resolve({
                    userId: '1',
                    userName: userName,
                    password: 'password',
                  });
                });
              }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate the user', async () => {
    const userName = faker.person.firstName();
    const user = await service.validateUser({
      username: userName,
      password: 'password',
    });
    expect(user).toEqual({
      userId: '1',
      userName: userName,
    });
  });

  it('should reject null if password is wrong', async () => {
    const userName = faker.person.firstName();
    try {
      await service.validateUser({
        username: userName,
        password: 'wrongpassword',
      });
    } catch (error) {
      expect(error).toBeNull();
    }
  });

  it('should reject null if user does not exist', async () => {
    try {
      await service.validateUser({
        username: noExistsUserName,
        password: 'password',
      });
    } catch (error) {
      expect(error).toBeNull();
    }
  });

  it('should return an access token', async () => {
    const data: any = {
      userName: faker.person.firstName(),
      _id: faker.string.uuid(),
    };

    const user = await service.login(data);
    expect(user).toEqual({
      access_token: 'token',
    });
  });
});
