import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StoryPlaceDocument = HydratedDocument<StoryPlace>;

export class StoryPlace {
  @Prop({ required: true, type: String, trim: true })
  description: string;
}

export const StoryPlaceSchema = SchemaFactory.createForClass(StoryPlace);
