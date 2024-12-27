import {
  InjectStripeClient,
  InjectStripeModuleConfig,
  StripeModuleConfig,
  StripeWebhookHandler,
} from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Stripe from 'stripe';
import { Subscription } from '../schemas/subscription.schema';
import { Model } from 'mongoose';

@Injectable()
export class SubscriptionWebhookService {
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
    // dataObject is the object which is sent by Stripe
    // ...
  }

  @StripeWebhookHandler('customer.subscription.updated')
  // implement here subscription delete in our Database
  async handleSubscriptionDelete(
    event: Stripe.CustomerSubscriptionUpdatedEvent,
  ): Promise<void> {
    this.subscriptionsModel.findOneAndUpdate();
    const dataObject = event.data.object as Stripe.Subscription;
    console.log(dataObject);
    // ...
  }
}
