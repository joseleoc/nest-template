import Stripe from 'stripe';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';

import { Subscription } from '@/schemas/subscription.schema';
import { UsersService } from '../users';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class SubscriptionWebhookService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger(SubscriptionWebhookService.name);
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    private readonly userService: UsersService,
    private readonly plansService: PlansService,
    @InjectModel(Subscription.name)
    private readonly subscriptionsModel: Model<Subscription>,
  ) {}

  // --------------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------------
  /** Trigger when the subscription status is updated and active */
  private handleUpdateSubscription() {}

  // --------------------------------------------------------------------------------
  // Public Methods
  // --------------------------------------------------------------------------------
  @StripeWebhookHandler('customer.subscription.deleted')
  // implement here subscription create in our Database
  async handleSubscriptionUpdate(event: Stripe.Event): Promise<void> {
    const dataObject = event.data.object as Stripe.Subscription;
    const { id } = dataObject;
    this.subscriptionsModel
      .findOneAndUpdate({ subscriptionId: id }, { status: dataObject.status })
      .then((res) => {
        if (res == null) {
          this.logger.error(`Subscription ${id} not found`);
          return;
        }
        this.logger.log(`Subscription ${id} cancelled`);
      })
      .catch((error) => {
        this.logger.error(error);
      });
    // dataObject is the object which is sent by Stripe
    // ...
  }

  @StripeWebhookHandler('customer.subscription.updated')
  // implement here subscription delete in our Database
  async handleSubscriptionDelete(
    event: Stripe.CustomerSubscriptionUpdatedEvent,
  ): Promise<void> {
    const dataObject = event.data.object as Stripe.Subscription;
    const {
      id: subscriptionId,
      status,
      current_period_start,
      current_period_end,
    } = dataObject;
    let priceId: string | undefined;

    // Loop through subscription items to find priceId
    for (const item of dataObject.items.data) {
      if (item.object === 'subscription_item') {
        priceId = item.price.id;
        break; // Exit loop after finding the first priceId
      }
    }

    let updateSubscriptionFields: Partial<Subscription> = {};

    if (status === 'active') {
      updateSubscriptionFields = {
        status,
        currentPeriodStart: current_period_start,
        currentPeriodEnd: current_period_end,
      };
    } else {
      updateSubscriptionFields = { status };
    }

    this.subscriptionsModel
      .findOneAndUpdate({ subscriptionId }, updateSubscriptionFields, {
        new: true,
      })
      .then((subscriptionDocument) => {
        // If subscription is not found, returns.
        if (subscriptionDocument == null) {
          this.logger.error(`Subscription ${subscriptionId} not found`);
          return;
        }
        // Logs the subscription update.
        this.logger.log(`Subscription ${subscriptionId} updated`);

        // If subscription is active, update user credits.
        if (status == 'active') {
          if (priceId != undefined) {
            const { userId } = subscriptionDocument;
            // Find the plan by the priceId
            this.plansService
              .findPlanByPriceId(priceId)
              .then((plan) => {
                const { creditsLimit } = plan;
                // Update the user credits
                this.userService
                  .updateCredits(userId, creditsLimit)
                  .then(() => {
                    this.logger.log(
                      `User ${userId} updated credits to ${creditsLimit}`,
                    );
                  })
                  .catch((error) => {
                    this.logger.error({
                      message: `Error updating user credits. User ${userId}. Plan ${plan.name}. Credits: ${creditsLimit}. subscriptionId: ${subscriptionId}`,
                      error,
                    });
                  });
              })
              .catch((error) => {
                this.logger.error({
                  message: `Error finding plan by priceId. PriceId: ${priceId}. subscriptionId: ${subscriptionId}`,
                  error,
                });
              });
          } else {
            this.logger.error(
              `PriceId not found for subscription ${subscriptionId}, status: ${status}, priceId: ${priceId}`,
            );
          }
        }
      })
      .catch((error) => {
        this.logger.error({
          message: `Error updating subscription ${subscriptionId}`,
          error,
        });
      });
  }
}
