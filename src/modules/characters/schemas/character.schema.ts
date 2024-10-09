import { Gender } from '@/general.types';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type characterDocument = HydratedDocument<Character>;

export class Character {
  @Prop({ required: true, type: String, trim: true })
  description: string;
  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: Object.values(Gender),
  })
  gender: Gender;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);
