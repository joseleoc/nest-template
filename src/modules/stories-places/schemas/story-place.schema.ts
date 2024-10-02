import { SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StoryPlaceDocument = HydratedDocument<StoryPlace>;

export class StoryPlace {
  name: string;
  age: number;
  gender: string;
}

export const StoryPlaceSchema = SchemaFactory.createForClass(StoryPlace);
