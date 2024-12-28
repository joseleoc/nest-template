import { Module } from '@nestjs/common';
import { SubscriptionWebhookService } from './stripe-webhook.service';
import { UsersModule } from '../users';
import { PlansModule } from '../plans/plans.module';

@Module({})
export class StripeWebhookModule {
  imports: [UsersModule, PlansModule];
  providers: [SubscriptionWebhookService];
}
