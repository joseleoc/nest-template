import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    MongooseModule.forRoot(process.env.DB_URL, { dbName: process.env.DB_NAME }),
    AuthModule,
    UsersModule,
    ChildrenModule,
    StoriesModule,
    NarratorsModule,
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
export class AppModule {}
