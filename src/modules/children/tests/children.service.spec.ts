import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenService } from '../children.service';
import { getModelToken } from '@nestjs/mongoose';
import { Child } from '../schemas/child.schema';
import { Model } from 'mongoose';

describe('ChildrenService', () => {
  let service: ChildrenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChildrenService,
        { provide: getModelToken(Child.name), useValue: Model<Child> },
      ],
    }).compile();

    service = module.get<ChildrenService>(ChildrenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
