import { Character } from '@/modules/characters/schemas/character.schema';
import { Child } from '@/modules/children/schemas/child.schema';
import { StoryPlace } from '@/modules/stories-places/schemas/story-place.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { StoryPurpose } from './story-purpose.schema';
import { Narrator } from '@/modules/narrators/schemas/narrators.schema';

export enum StoryStyle {
  'FICTIONAL' = 'FICTIONAL',
  'NON_FICTIONAL' = 'NON_FICTIONAL',
}

export const StoryDefaultThumbnail = 'story-default-thumbnail.png';

export type StoryDocument = HydratedDocument<Story>;

@Schema({
  timestamps: true,
  toObject: { versionKey: false },
  toJSON: { versionKey: false },
})
export class Story {
  @Prop({ required: true, type: String, trim: true })
  title: string;

  @Prop({ required: true, type: Array<string>, trim: true, default: [] })
  content: string[];

  @Prop({ required: true, type: String, trim: true })
  summary: string;

  @Prop({
    required: true,
    type: Character,
    trim: true,
  })
  mainCharacter: Character;

  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: Object.values(StoryStyle),
  })
  storyStyle: keyof typeof StoryStyle;

  @Prop({ required: true, type: StoryPurpose, trim: true })
  solveProblem: StoryPurpose;

  @Prop({ required: true, type: String, trim: true, default: '' })
  storyHelp: string;

  @Prop({ required: true, type: Narrator, trim: true })
  storyNarrator: Narrator;

  @Prop({
    required: true,
    type: StoryPlace,
    trim: true,
  })
  storyPlace: StoryPlace;

  @Prop({ required: true, type: Array<string>, default: [] })
  images: string[];

  @Prop({
    required: false,
    type: String,
    trim: true,
    default: StoryDefaultThumbnail,
  })
  thumbnail?: string;

  @Prop({ required: false, type: String, trim: true, ref: Child.name })
  childId?: string;

  @Prop({ required: true, type: String, trim: true, ref: User.name })
  userId?: string;

  @Prop({ required: false, type: String, default: '' })
  finalDetails?: string;

  @Prop({ required: false, type: Number, default: 0 })
  readingTime?: number;
}

export const StorySchema = SchemaFactory.createForClass(Story);
