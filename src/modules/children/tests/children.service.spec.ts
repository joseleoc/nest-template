import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenService } from '../children.service';
import { getModelToken } from '@nestjs/mongoose';
import { Child, Genders } from '../schemas/child.schema';
import { CreateChildDto } from '../dto/create-child.dto';
import { faker } from '@faker-js/faker';
import { MockMongooseModel } from '@/tests/mock.mongoose.model';
import { User } from '@/modules/users/schemas/user.schema';

describe('ChildrenService', () => {
  let service: ChildrenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChildrenService,
        {
          provide: getModelToken(Child.name),
          useValue: MockMongooseModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: { findById: () => Promise.resolve({ deleted: false }) },
        },
      ],
    }).compile();

    service = module.get<ChildrenService>(ChildrenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a child', async () => {
    const childToCreate: CreateChildDto = {
      parentId: '123',
      name: faker.person.fullName(),
      age: 10,
      gender: Genders.MALE,
    };
    const res = await service.create(childToCreate);
    expect(res).toBeTruthy();
  });
});
