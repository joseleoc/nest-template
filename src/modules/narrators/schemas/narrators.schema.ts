import { Gender, Language } from '@/types/general.types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum NarratorAgeCategory {
  'ELDERLY' = 'Elderly',
  'TEENAGER' = 'Teenager',
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

  @Prop({
    required: true,
    type: String,
    enum: Object.values(Language),
    default: Language.EN,
  })
  language: Language;
}

export const NarratorSchema = SchemaFactory.createForClass(Narrator);
