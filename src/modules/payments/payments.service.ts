import Stripe from 'stripe';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Subscription } from '../../schemas/subscription.schema';
import { Model } from 'mongoose';

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
    @InjectModel(Subscription.name)
    private readonly subscriptionsModel: Model<Subscription>,

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

  createCustomer(params: CreateCustomerDto): Promise<string> {
    return new Promise((resolve, reject) => {
      const { email, name } = params;
      this.stripe.customers
        .create({
          email,
          name,
        })
        .then((customer) => {
          resolve(customer.id);
        })
        .catch((error) => {
          this.logger.error(error);
          reject({
            message:
              error?.err?.message ||
              error?.message ||
              'Error creating customer',
            code: error?.err?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
          });
        });
    });
  }

  async createSubscriptionSession(params: CreateSubscriptionDto): Promise<{
    subscriptionId: string;
    clientSecret: string;
  } | null> {
    return new Promise((resolve, reject) => {
      const { userId, priceId, customerId } = params;

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
}
