import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtAuthGuard } from '@/guards';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { UsersModule } from './modules/users';
import { AuthModule } from './modules/auth/auth.module';
import { ChildrenModule } from './modules/children/children.module';
import { StoriesModule } from './modules/stories/stories.module';
import { NarratorsModule } from './modules/narrators/narrators.module';
import { CharactersModule } from './modules/characters/characters.module';
import { StoriesPlacesModule } from './modules/stories-places/stories-places.module';
import { PlansModule } from './modules/plans/plans.module';
import { AiModule } from './modules/ai/ai.module';
import { LoggerModule } from 'nestjs-pino';
import {
  CORRELATION_ID_HEADER,
  CorrelationIdMiddleware,
} from './middlewares/correlation-id/correlation-id.middleware';
import { Request } from 'express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
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
    MongooseModule.forRoot(process.env.DB_URL, { dbName: process.env.DB_NAME }),
    AuthModule,
    UsersModule,
    ChildrenModule,
    StoriesModule,
    NarratorsModule,
    CharactersModule,
    StoriesPlacesModule,
    PlansModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Make all the endpoints guarded by JwtAuthGuard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
