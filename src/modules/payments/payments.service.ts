import Stripe from 'stripe';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InjectStripeClient,
  StripeWebhookHandler,
} from '@golevelup/nestjs-stripe';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Subscription } from '../../schemas/subscription.schema';
import { Model } from 'mongoose';
import { PlansService } from '../plans/plans.service';
import { UsersService } from '../users/users.service';
import { PlanNames } from '../plans/schemas/plan.schema';
import { Payment } from '@/schemas/payments.schema';

@Injectable()
export class PaymentsService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger(PaymentsService.name);
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    private plansService: PlansService,
    private UsersService: UsersService,
    @InjectModel(Subscription.name)
    private readonly subscriptionsModel: Model<Subscription>,
    @InjectModel(Payment.name)
    private readonly paymentsModel: Model<Payment>,
    private configService: ConfigService,
    @InjectStripeClient() private stripe: Stripe,
  ) {
    this.checkEnvVariables();
    // this.setupStripe();k
  }

  // --------------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------------
  private checkEnvVariables(): void {
    if (!this.configService.get('STRIPE_SECRET_KEY')) {
      throw new Error(
        'One or more environment variables are not set. Please check your .env file.',
      );
    }
  }

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------

  async createSubscriptionSession(params: CreateSubscriptionDto): Promise<{
    subscriptionId: string;
    clientSecret: string;
  } | null> {
    return new Promise((resolve, reject) => {
      const { userId, priceId, customerId, planId } = params;

      this.stripe.subscriptions
        .create({
          customer: customerId,
          items: [
            {
              price: priceId,
            },
          ],
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
        })
        .then((subscription) => {
          if (subscription == null) {
            resolve(null);
            return null;
          }

          return subscription;
        })
        .then((subscription) => {
          if (subscription == null) {
            reject({
              message: 'Subscription not found',
              code: HttpStatus.BAD_REQUEST,
            });
            return null;
          }

          const subscriptionId = subscription.id;
          const clientSecret = (
            (subscription.latest_invoice as Stripe.Invoice)
              .payment_intent as Stripe.PaymentIntent
          ).client_secret as string;

          return this.subscriptionsModel.create({
            userId,
            subscriptionId: subscriptionId,
            clientSecret: clientSecret,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            customerId: subscription.customer,
            status: subscription.status,
            planId,
          });
        })
        .then((subscription) => {
          if (subscription == null) {
            reject({
              message: 'Error creating subscription',
              code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
            return null;
          }
          resolve(subscription.toObject());
        })
        .catch((error) => {
          this.logger.error(error);
          reject({
            message:
              error?.err?.message ||
              error?.message ||
              'Error creating subscription',
            code: HttpStatus.INTERNAL_SERVER_ERROR,
          });
        });
    });
  }

  async getPortal(
    customerId: string,
  ): Promise<Stripe.Response<Stripe.BillingPortal.Session>> {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
    });
  }

  // --------------------------------------------------------------------------------
  // Stripe webhook event handlers
  // --------------------------------------------------------------------------------

  @StripeWebhookHandler('customer.subscription.deleted')
  async handleSubscriptionUpdate(event: Stripe.Event): Promise<void> {
    const dataObject = event.data.object as Stripe.Subscription;
    const { id } = dataObject;
    this.subscriptionsModel
      .findOneAndUpdate(
        { subscriptionId: id },
        { status: dataObject.status },
        { new: true },
      )
      .then((subscription) => {
        if (subscription == null) {
          this.logger.error(`Subscription ${id} not found`);
          return;
        }
        this.logger.log(`Subscription ${id} cancelled`);
        const { userId, subscriptionId, customerId } = subscription;
        this.paymentsModel
          .create({
            userId,
            subscriptionId,
            customerId,
            amount: dataObject.items.data[0].price.unit_amount,
            planId: subscription.planId,
          })
          .then(() => {
            this.logger.log(
              `Payment created for subscription ${subscriptionId}`,
            );
          })
          .catch((error) => {
            this.logger.error(error);
          });
      })
      .catch((error) => {
        this.logger.error(error);
      });
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
                const { creditsLimit, name } = plan;
                // Update the user credits
                this.UsersService.updateCredits(
                  userId,
                  creditsLimit,
                  name as PlanNames,
                )
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
