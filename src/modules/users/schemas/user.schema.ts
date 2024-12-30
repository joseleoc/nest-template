import { Language } from '@/types/general.types';
import { Plan, PlanNames } from '@/modules/plans/schemas/plan.schema';
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
  @Prop({ type: String, trim: true, unique: true })
  firebaseUid: string;

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

  @Prop({ default: Date.now, type: Date })
  createdAt?: Date;

  @Prop({ default: PlanNames.FREE_TIER, enum: Object.values(PlanNames) })
  plan: PlanNames;

  @Prop({ type: String, ref: Plan.name })
  planId: string;

  @Prop({ default: Language.EN, enum: Object.values(Language) })
  language: Language;

  @Prop({ default: 0, type: Number })
  credits: number;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Array<string>, default: [], required: false })
  customerIds?: string[];

  constructor(user: User) {
    Object.assign(this, user);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create indexes for efficient querying
UserSchema.index({ userName: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ firebaseUid: 1 }, { unique: true });
