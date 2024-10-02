import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenController } from '../children.controller';
import { ChildrenService } from '../children.service';
import { getModelToken } from '@nestjs/mongoose';
import { Child } from '../schemas/child.schema';
import { Model } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { MockMongooseModel } from '@/tests/mock.mongoose.model';

describe('ChildrenController', () => {
  let controller: ChildrenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildrenController],
      providers: [
        ChildrenService,
        { provide: getModelToken(Child.name), useValue: Model<Child> },
        {
          provide: getModelToken(User.name),
          useValue: MockMongooseModel,
        },
      ],
    }).compile();

    controller = module.get<ChildrenController>(ChildrenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
