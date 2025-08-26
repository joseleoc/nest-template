import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Request } from 'express';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { LoggerModule } from 'nestjs-pino';
import { UsersModule } from './modules/users';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CORRELATION_ID_HEADER } from './middleware/correlation-id.middleware';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
          process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'QA'
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
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    // Make all the endpoints guarded by JwtAuthGuard
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule {}
