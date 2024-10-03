import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { PlansModule } from '../plans/plans.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PlansModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, ConfigService, UsersController],
  exports: [UsersService, UsersController],
})
export class UsersModule {}
