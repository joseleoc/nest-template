import {
  InjectStripeClient,
  InjectStripeModuleConfig,
  StripeModuleConfig,
  StripeWebhookHandler,
} from '@golevelup/nestjs-stripe';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Stripe from 'stripe';
import { Subscription } from '../schemas/subscription.schema';
import { Model } from 'mongoose';

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
    @InjectModel(Subscription.name)
    private readonly subscriptionsModel: Model<Subscription>,
    @InjectStripeClient() private stripe: Stripe,
    @InjectStripeModuleConfig() config: StripeModuleConfig,
  ) {
    console.log(config);
  }

  @StripeWebhookHandler('customer.subscription.deleted')
  // implement here subscription create in our Database
  async handleSubscriptionUpdate(event: Stripe.Event): Promise<void> {
    console.log({ event });
    const dataObject = event.data.object as Stripe.Subscription;
    console.log({ dataObject });
    const { id } = dataObject;
    this.subscriptionsModel
      .findOneAndUpdate(
        { subscriptionId: 'sub_1QaiGdDtWVIpSmG73VgAlKOA' },
        { status: dataObject.status },
      )
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
    console.log(dataObject);
    const { id, status, current_period_start, current_period_end } = dataObject;

    let updatedFields: Partial<Subscription> = {};

    if (status === 'active') {
      updatedFields = {
        status,
        currentPeriodStart: current_period_start,
        currentPeriodEnd: current_period_end,
      };
    } else {
      updatedFields = { status };
    }

    this.subscriptionsModel
      .findOneAndUpdate(
        { subscriptionId: 'sub_1QaiGdDtWVIpSmG73VgAlKOA' },
        updatedFields,
      )
      .then((res) => {
        if (res == null) {
          this.logger.error(`Subscription ${id} not found`);
          return;
        }
        this.logger.log(`Subscription ${id} updated`);
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }
}
