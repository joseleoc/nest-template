import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  stripe: Stripe;
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
}
