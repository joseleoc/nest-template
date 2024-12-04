import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

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
  constructor(private configService: ConfigService) {
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

  getPaymentSheet(params: any) {
    return new Promise((resolve, reject) => {
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
              amount: 1099,
              currency: 'usd',
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
        });
      resolve(params);
    });
  }
}
