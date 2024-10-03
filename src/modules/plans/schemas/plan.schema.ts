import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum PlanNames {
  MAGIC_TALES = 'MAGIC_TALES',
  AMAZING_STORIES = 'AMAZING_STORIES',
  UNLIMITED_WORLDS = 'UNLIMITED_WORLDS',
}

export type PlanDocument = HydratedDocument<Plan>;

@Schema()
export class Plan {
  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: Object.values(PlanNames),
  })
  name: string;

  @Prop({ required: true, type: Number, min: 0, default: 5 })
  creditsLimit: number;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ required: true, type: Boolean, default: true })
  accessToText: boolean;

  @Prop({ required: true, type: Boolean, default: false })
  accessToVoice: boolean;

  @Prop({ required: true, type: Boolean, default: false })
  accessToImage: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
