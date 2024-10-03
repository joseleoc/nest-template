import { Test, TestingModule } from '@nestjs/testing';
import { PlansController } from '../plans.controller';
import { PlansService } from '../plans.service';
import { getModelToken } from '@nestjs/mongoose';
import { Plan } from '../schemas/plan.schema';
import { Model } from 'mongoose';

describe('PlansController', () => {
  let controller: PlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlansController],
      providers: [
        PlansService,
        { provide: getModelToken(Plan.name), useValue: Model<Plan> },
      ],
    }).compile();

    controller = module.get<PlansController>(PlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
