import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { Model } from 'mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: Model<User> },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
