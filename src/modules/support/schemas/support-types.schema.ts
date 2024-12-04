import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SupportTypesDocument = HydratedDocument<SupportTypes>;

@Schema({
  toObject: {
    versionKey: false,
  },
  toJSON: {
    versionKey: false,
  },
})
export class SupportTypes {
  @Prop({ required: true, type: String, trim: true })
  type: string;

  @Prop({ required: false, type: String, trim: true })
  details?: string;

  @Prop({ required: true, type: String, trim: true })
  label: string;
}

export const SupportTypesSchema = SchemaFactory.createForClass(SupportTypes);
