import { Language } from '@/general.types';
import { PlanNames } from '@/modules/plans/schemas/plan.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  toObject: {
    versionKey: false,
  },
  toJSON: {
    versionKey: false,
  },
})
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

  @Prop({ default: PlanNames.MAGIC_TALES, enum: Object.values(PlanNames) })
  plan: PlanNames;

  @Prop({ default: Language.EN, enum: Object.values(Language) })
  language: Language;

  // @Prop({ default: {}, type: Object })
  // Billing?: unknown;

  // @Prop({ default: {}, type: Object })
  // storyConfig?: unknown;

  @Prop({ default: 0, type: Number })
  credits: number;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  constructor(user: User) {
    Object.assign(this, user);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
