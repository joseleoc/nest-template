import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Plan, UserLanguage } from '../entities/user.entity';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, type: String, trim: true, unique: true })
  userName: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
    unique: true,
    validate: {
      validator: (email: string) => {
        const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailRegex.test(email);
      },
      message: `{VALUE} is not a valid email`,
    },
  })
  email: string;

  @Prop({ type: String, required: true, trim: true, minlength: 6 })
  password?: string;

  @Prop({ default: Date.now, type: Date })
  createdAt?: Date;

  @Prop({ default: Plan.FREE, enum: Object.values(Plan) })
  Plan: Plan;

  @Prop({ default: UserLanguage.EN, enum: Object.values(UserLanguage) })
  language: UserLanguage;

  @Prop({ default: {}, type: Object })
  Billing: unknown;

  @Prop({ default: {}, type: Object })
  storyConfig: unknown;

  @Prop({ default: 0, type: Number })
  credits: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaName = 'User';
