import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Plan, PlanNames } from './schemas/plan.schema';
import { DefaultPlans } from './plans.constants';
import { PublicPlan } from './plans.types';
import {
  Subscription,
  SubscriptionDocument,
} from '@/schemas/subscription.schema';

@Injectable()
export class PlansService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger(PlansService.name);
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<Subscription>,
  ) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------

  /**
   * This method is used to save the plans to the database for the first time only.
   * It checks if the plans exist in the database, if not, it creates them.
   *
   * `Important:` this method should be called only once.
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
          if (documentsToCreate.length === 0) {
            resolve();
            return;
          }
          this.planModel
            .insertMany(documentsToCreate)
            .then(() => {
              resolve();
            })
            .catch((error) => {
              this.logger.error(error);
              reject(error);
            });
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  /** Finds all plans */
  findAll(): Promise<Plan[]> {
    return new Promise((resolve, reject) => {
      this.planModel
        .find()
        .then((plans) => {
          const plansToSend = plans.map((plan) => new PublicPlan(plan));
          resolve(plansToSend);
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  findPlanByName(name: keyof typeof PlanNames): Promise<Plan | null> {
    return new Promise((resolve, reject) => {
      this.planModel
        .findOne({ name })
        .then((plan) => {
          if (plan != null) {
            resolve(plan);
          } else {
            reject(null);
          }
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  findPlanByPriceId(priceId: string): Promise<Plan> {
    return new Promise((resolve, reject) => {
      this.planModel
        .findOne({ priceId })
        .then((plan) => {
          if (plan != null) {
            resolve(plan);
          } else {
            reject(null);
          }
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  findSubscriptionByUserId(userId: string): Promise<SubscriptionDocument> {
    return new Promise((resolve, reject) => {
      this.subscriptionModel
        .findOne({ userId })
        .then((subscription) => {
          if (subscription != null) {
            resolve(subscription);
          } else {
            reject(null);
          }
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }
}
