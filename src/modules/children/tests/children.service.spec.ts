import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenService } from '../children.service';
import { getModelToken } from '@nestjs/mongoose';
import { Child, Genders } from '../schemas/child.schema';
import { CreateChildDto } from '../dto/create-child.dto';
import { faker } from '@faker-js/faker';
import { MockMongooseModel } from '@/tests/mock.mongoose.model';

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

  it('should reject to create a child with errors', async () => {
    const childToCreate: any = {};
    jest.spyOn(MockMongooseModel, 'create').mockRejectedValue('test');
    try {
      await service.create(childToCreate);
    } catch (error) {
      expect(error).toBe('test');
    }
  });
});
