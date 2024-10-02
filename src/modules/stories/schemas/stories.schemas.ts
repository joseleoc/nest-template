import { Character } from '@/modules/characters/entities/character.entity';
import { Narrator } from '@/modules/narrators/entities/narrator.entity';
import { StoryPlace } from '@/modules/stories-places/schemas/story-place.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';

export enum StoryStyle {
  'FICTIONAL' = 'FICTIONAL',
  'NON_FICTIONAL' = 'NON_FICTIONAL',
}

export type StoryDocument = HydratedDocument<Story>;

@Schema()
export class Story {
  @Prop({ required: true, type: String, trim: true })
  title: string;

  @Prop({ required: true, type: String, trim: true })
  content: string;

  @Prop({ required: false, type: String, trim: true })
  description?: string;

  @Prop({
    required: false,
    type: MongoSchema.Types.ObjectId,
    ref: Narrator.name,
    trim: true,
  })
  narratorId?: string;

  @Prop({
    required: false,
    type: String,
    trim: true,
    enum: Object.values(StoryStyle),
  })
  style: keyof typeof StoryStyle;

  @Prop({ required: false, type: String, trim: true })
  aboutId?: string;

  @Prop({
    required: false,
    type: MongoSchema.Types.ObjectId,
    trim: true,
    ref: Character.name,
  })
  characterId?: string;

  @Prop({
    required: false,
    type: MongoSchema.Types.ObjectId,
    trim: true,
    ref: StoryPlace.name,
  })
  placeId?: string;
}

export const StorySchema = SchemaFactory.createForClass(Story);
