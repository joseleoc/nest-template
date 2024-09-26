import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Tier } from '../entities/user.entity';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  userName: string;

  @Prop()
  password?: string;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Tier.FREE })
  tier: Tier;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaName = 'User';
