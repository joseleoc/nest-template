import { Gender } from '@/general.types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum NarratorAgeCategory {
  'EDERLY' = 'Ederly',
  'YOUNG' = 'Young',
  'ADULT' = 'Adult',
  'CHILD' = 'Child',
}

export type NarratorDocument = HydratedDocument<Narrator>;

@Schema({
  toObject: {
    versionKey: false,
  },
  toJSON: {
    versionKey: false,
  },
})
export class Narrator {
  @Prop({ required: true, type: String, trim: true, unique: true })
  name: string;

  @Prop({ required: true, type: String, trim: true, unique: true })
  voiceId: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(NarratorAgeCategory),
    default: NarratorAgeCategory.ADULT,
  })
  ageCategory: NarratorAgeCategory;

  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: Object.values(Gender),
  })
  gender: Gender;
}

export const NarratorSchema = SchemaFactory.createForClass(Narrator);
