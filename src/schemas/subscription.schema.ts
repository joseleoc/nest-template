import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import Stripe from 'stripe';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({
  toObject: {
    versionKey: false,
  },
  toJSON: {
    versionKey: false,
  },
  timestamps: true,
})
export class Subscription {
  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ required: true, type: String, unique: true })
  subscriptionId: string;

  @Prop({ required: true, type: String })
  clientSecret: string;

  @Prop({ required: true, type: Number })
  currentPeriodStart: number;

  @Prop({ required: true, type: Number })
  currentPeriodEnd: number;

  @Prop({ required: true, type: String })
  customerId: string;

  @Prop({
    required: true,
    type: String,
  })
  status: Stripe.Subscription.Status;

  @Prop({ required: true, type: String })
  planId: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

SubscriptionSchema.index({ subscriptionId: 1 }, { unique: true });
SubscriptionSchema.index({ userId: 1 }, { unique: false });
