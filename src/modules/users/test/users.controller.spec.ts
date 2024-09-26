import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '../users.service';

import { UsersController } from '../users.controller';
import { UsersServiceMock } from './users.mocks';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: UsersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
