import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Plan } from './schemas/plan.schema';
import { DefaultPlans } from './plans.constants';

@Injectable()
export class PlansService {
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
  ) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  /**
   * This method is used to save the plans to the database for the first time only.
   * It checks if the plans exist in the database, if not, it creates them.
   */
  createPlansIfNotExist(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.planModel
        .find()
        .then((existingPlans) => {
          const documentsToCreate = DefaultPlans.filter(
            (plan) =>
              !existingPlans.some(
                (existingPlan) => existingPlan.name === plan.name,
              ),
          );
          this.planModel
            .insertMany(documentsToCreate)
            .then(() => {
              resolve();
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });
  }
}
