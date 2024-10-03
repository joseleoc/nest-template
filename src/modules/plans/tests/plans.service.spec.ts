import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from '../plans.service';
import { Plan } from '../schemas/plan.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('PlansService', () => {
  let service: PlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        { provide: getModelToken(Plan.name), useValue: Model<Plan> },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
