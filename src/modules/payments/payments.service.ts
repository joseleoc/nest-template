import Stripe from 'stripe';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentSheetDto } from './dto/payment-sheet.dto';
import { PaymentIntentDto } from './dto/payment-intent.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PaymentsService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.checkEnvVariables();
    this.setupStripe();
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

  private setupStripe() {
    const stripeSecretKey: string | undefined =
      this.configService.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error(
        'One or more environment variables are not set. Please check your .env file.',
      );
    }
    this.stripe = new Stripe(stripeSecretKey);
  }

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------

  createCostumer(params: CreateCustomerDto): Promise<string> {
    return new Promise((resolve, reject) => {
      const { email, name, userId } = params;
      this.stripe.customers
        .create({
          email,
          name,
        })
        .then((customer) => {
          return Promise.all([
            customer.id,
            this.usersService.addCostumerIdToUser({
              userId,
              customerId: customer.id,
            }),
          ]);
        })
        .then(([customerId]) => {
          resolve(customerId);
        })
        .catch((error) => {
          this.logger.error(error);
          reject({
            message: 'Error creating customer',
            code: HttpStatus.INTERNAL_SERVER_ERROR,
          });
        });
    });
  }

  createSubscription() {
    return new Promise((resolve, reject) => {
      this.stripe.subscriptions
        .create({
          customer: 'customerId',
          items: [
            {
              price: 'priceId',
            },
          ],
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
        })
        .then((subscription) => {
          console.log(subscription);
          //Store the subscription fields to the database
          const { id, current_period_end, current_period_start, customer } =
            subscription;
          resolve({
            subscriptionId: subscription.id,
            clientSecret: (
              (subscription.latest_invoice as Stripe.Invoice)
                .payment_intent as Stripe.PaymentIntent
            ).client_secret,
          });
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

  getPaymentSheet(params: PaymentSheetDto) {
    return new Promise((resolve, reject) => {
      const { amount, currency } = params;
      const PublicKey = this.configService.get('STRIPE_PUBLIC_KEY');
      if (!PublicKey) {
        reject('No STRIPE_PUBLIC_KEY found in the environment variables');
      }

      this.stripe.customers
        .create()
        .then((customer) => {
          return Promise.all([
            this.stripe.ephemeralKeys.create(
              { customer: customer.id },
              { apiVersion: '2024-11-20.acacia' },
            ),
            customer,
          ]);
        })
        .then(([ephemeralKey, customer]) => {
          return Promise.all([
            this.stripe.paymentIntents.create({
              amount,
              currency,
              customer: customer.id,
            }),
            ephemeralKey,
            customer,
          ]);
        })
        .then(([paymentIntent, ephemeralKey, customer]) => {
          resolve({
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
            publishableKey: PublicKey,
          });
        })
        .catch((error) => {
          this.logger.error(error);
          reject({
            message: 'Error getting payment sheet',
            code: HttpStatus.INTERNAL_SERVER_ERROR,
          });
        });
    });
  }

  paymentIntent(
    params: PaymentIntentDto,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return new Promise((resolve, reject) => {
      const { amount, currency, paymentMethodTypes } = params;
      this.stripe.paymentIntents
        .create({
          payment_method_types: paymentMethodTypes,
          amount,
          currency,
        })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          this.logger.error(error);
          reject({
            message: 'Error getting payment intent',
            code: HttpStatus.INTERNAL_SERVER_ERROR,
          });
        });
    });
  }
}
