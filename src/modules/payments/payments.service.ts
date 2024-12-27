import Stripe from 'stripe';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Subscription } from './schemas/subscription.schema';
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

  // private setupStripe() {
  //   const stripeSecretKey: string | undefined =
  //     this.configService.get('STRIPE_SECRET_KEY');
  //   if (!stripeSecretKey) {
  //     throw new Error(
  //       'One or more environment variables are not set. Please check your .env file.',
  //     );
  //   }
  //   this.stripe = new Stripe(stripeSecretKey);
  // }

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
            message: error.err.message || 'Error creating customer',
            code: error.err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
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
            message: 'Error creating subscription',
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

  // createSubscriptionSession(params: { priceId: string; customerId: string }) {
  //   return new Promise((resolve, reject) => {
  //     const { priceId, customerId } = params;
  //     this.stripe.subscriptions
  //       .create({
  //         customer: customerId,
  //         items: [
  //           {
  //             price: priceId,
  //           },
  //         ],
  //         payment_behavior: 'default_incomplete',
  //         payment_settings: { save_default_payment_method: 'on_subscription' },
  //         expand: ['latest_invoice.payment_intent'],
  //       })
  //       .then((subscription) => {
  //         console.log(subscription);
  //         //Store the subscription fields to the database
  //         const { id, current_period_end, current_period_start, customer } =
  //           subscription;
  //         resolve({
  //           subscriptionId: subscription.id,
  //           clientSecret: (
  //             (subscription.latest_invoice as Stripe.Invoice)
  //               .payment_intent as Stripe.PaymentIntent
  //           ).client_secret,
  //         });
  //       })
  //       .catch((error) => {
  //         this.logger.error(error);
  //         console.log({ error });

  //         reject({
  //           message: error?.raw?.message || 'Error creating customer',
  //           code: error?.raw?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
  //         });
  //       });
  //   });
  // }

  // getPaymentSheet(params: PaymentSheetDto) {
  //   return new Promise((resolve, reject) => {
  //     const { amount, currency } = params;
  //     this.stripe.customers
  //       .create()
  //       .then((customer) => {
  //         return Promise.all([
  //           this.stripe.ephemeralKeys.create(
  //             { customer: customer.id },
  //             { apiVersion: '2024-11-20.acacia' },
  //           ),
  //           customer,
  //         ]);
  //       })
  //       .then(([ephemeralKey, customer]) => {
  //         return Promise.all([
  //           this.stripe.paymentIntents.create({
  //             amount,
  //             currency,
  //             customer: customer.id,
  //           }),
  //           ephemeralKey,
  //           customer,
  //         ]);
  //       })
  //       .then(([paymentIntent, ephemeralKey, customer]) => {
  //         resolve({
  //           paymentIntent: paymentIntent.client_secret,
  //           ephemeralKey: ephemeralKey.secret,
  //           customer: customer.id,
  //         });
  //       })
  //       .catch((error) => {
  //         this.logger.error(error);
  //         reject({
  //           message: 'Error getting payment sheet',
  //           code: HttpStatus.INTERNAL_SERVER_ERROR,
  //         });
  //       });
  //   });
  // }

  // paymentIntent(
  //   params: PaymentIntentDto,
  // ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
  //   return new Promise((resolve, reject) => {
  //     const { amount, currency, paymentMethodTypes } = params;
  //     this.stripe.paymentIntents
  //       .create({
  //         payment_method_types: paymentMethodTypes,
  //         amount,
  //         currency,
  //       })
  //       .then((res) => {
  //         resolve(res);
  //       })
  //       .catch((error) => {
  //         this.logger.error(error);
  //         reject({
  //           message: 'Error getting payment intent',
  //           code: HttpStatus.INTERNAL_SERVER_ERROR,
  //         });
  //       });
  //   });
  // }

  // constructEvent(rawBody: Buffer | undefined, sig: string) {
  //   const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
  //   if (!webhookSecret) {
  //     throw new Error(
  //       'No STRIPE_WEBHOOK_SECRET found in the environment variables',
  //     );
  //   }

  //   if (rawBody == undefined || sig == undefined) {
  //     throw new Error('rawBody or sig is undefined');
  //   }
  //   return this.stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  // }

  // handleSubscriptionWebhook(params: { event: Stripe.Event }): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const { event } = params;

  //     // Handle event
  //     switch (event.type) {
  //       // Event when the subscription started
  //       case 'payment_intent.succeeded':
  //         //   const paymentIntentSucceeded = event.data.object;
  //         console.log('new Subscription started!');
  //         break;

  //       case 'invoice.paid':
  //         // Event when the payment was successful (every subscription interval)
  //         console.log('Invoice paid!');
  //         break;

  //       case 'invoice.payment_failed':
  //         // Event when card problems or insufficient funds (every subscription interval)
  //         console.log('Invoice payment failed!');
  //         //   console.log(event.data);
  //         break;

  //       case 'customer.subscription.updated':
  //         // Event when the subscription is updated
  //         console.log('Subscription updated!');
  //         //   console.log(event.data);
  //         break;

  //       default:
  //         console.log(`Unhandled event type ${event.type}`);
  //         break;
  //     }
  //     resolve();
  //   });
  // }
}
