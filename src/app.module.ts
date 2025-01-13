import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtAuthGuard } from '@/guards';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';

import { UsersModule } from './modules/users';
import { AuthModule } from './modules/auth/auth.module';
import { ChildrenModule } from './modules/children/children.module';
import { StoriesModule } from './modules/stories/stories.module';
import { NarratorsModule } from './modules/narrators/narrators.module';
import { PlansModule } from './modules/plans/plans.module';
import { LoggerModule } from 'nestjs-pino';
import {
  CORRELATION_ID_HEADER,
  CorrelationIdMiddleware,
} from './middlewares/correlation-id/correlation-id.middleware';
import { Request } from 'express';
import { TextToSpeechService } from './services/text-to-speech/text-to-speech.service';
import { ServicesModule } from './services/services.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SupportModule } from './modules/support/support.module';
import { StripeWebhookModule } from './modules/stripe-webhook/stripe-webhook.module';
import configs from './config/app.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [configs],
    }),
    // Rate limit for requests, see https://docs.nestjs.com/techniques/rate-limiting
    // In this case, the limit is 60 requests per minute
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  messageKey: 'message',
                },
              }
            : undefined,
        messageKey: 'message',
        customProps: (req: Request) => ({
          correlationId: req[CORRELATION_ID_HEADER],
        }),
        autoLogging: false,
        serializers: {
          req: () => {
            return undefined;
          },
          response: () => {
            return undefined;
          },
        },
      },
    }),
    MongooseModule.forRoot(process.env.DB_URL || '', {
      dbName: process.env.DB_NAME,
    }),
    AuthModule,
    UsersModule,
    ChildrenModule,
    StoriesModule,
    NarratorsModule,
    PlansModule,
    ServicesModule,
    PaymentsModule,
    SupportModule,
    StripeWebhookModule,
  ],
  controllers: [AppController],
  providers: [
    // Make all the endpoints guarded by JwtAuthGuard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    TextToSpeechService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
