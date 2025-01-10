import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum PlanNames {
  FREE_TIER = 'FREE_TIER',
  LOW_TIER = 'LIMITED_STORIES',
  MEDIUM_TIER = 'AMAZING_STORIES',
  HIGH_TIER = 'UNLIMITED_STORIES',
}

export type PlanDocument = HydratedDocument<Plan>;

@Schema()
export class Plan {
  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: Object.values(PlanNames),
    unique: true,
  })
  name: string;

  @Prop({ required: true, type: Number, min: 0, default: 5 })
  creditsLimit: number | 'Infinity';

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ required: true, type: Boolean, default: true })
  accessToText: boolean;

  @Prop({ required: true, type: Boolean, default: false })
  accessToVoice: boolean;

  @Prop({ required: true, type: Boolean, default: false })
  accessToImage: boolean;

  @Prop({ required: true, type: String, default: false })
  priceId: string;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
