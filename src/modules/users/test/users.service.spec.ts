import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { PlansModule } from '@/modules/plans/plans.module';
import { PlansService } from '@/modules/plans/plans.service';
import { ConfigService } from '@nestjs/config';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PlansModule],
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: Model<User> },
        { provide: PlansService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
