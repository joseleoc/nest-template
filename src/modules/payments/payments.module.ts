import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeModule } from '@golevelup/nestjs-stripe';
import {
  Subscription,
  SubscriptionSchema,
} from '../../schemas/subscription.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    StripeModule.forRootAsync(StripeModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('STRIPE_CONFIG');
        if (config == undefined)
          throw new Error(
            'No STRIPE_CONFIG found in the environment variables',
          );
        return config;
      },
    }),
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
