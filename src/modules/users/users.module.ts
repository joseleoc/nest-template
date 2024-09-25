import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, UserSchemaName } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserSchemaName, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersController],
  exports: [UsersService, UsersController],
})
export class UsersModule {}
