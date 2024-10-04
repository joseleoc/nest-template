import { Character } from '@/modules/characters/entities/character.entity';
import { Child } from '@/modules/children/schemas/child.schema';
import { Narrator } from '@/modules/narrators/entities/narrator.entity';
import { StoryPlace } from '@/modules/stories-places/schemas/story-place.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';

export enum StoryStyle {
  'FICTIONAL' = 'FICTIONAL',
  'NON_FICTIONAL' = 'NON_FICTIONAL',
}

export const StoryDefaultThumbnail = 'story-default-thumbnail.png';

export type StoryDocument = HydratedDocument<Story>;

@Schema({ timestamps: true })
export class Story {
  @Prop({ required: true, type: String, trim: true })
  title: string;

  @Prop({ required: true, type: Array<string>, trim: true, default: [] })
  content: string[];

  @Prop({ required: true, type: String, trim: true })
  summary: string;

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
  storyPurpose?: string;

  @Prop({ required: false, type: String, trim: true })
  coreIssue?: string;

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

  @Prop({ required: true, type: Array<string>, default: [] })
  images: string[];

  @Prop({
    required: true,
    type: String,
    trim: true,
    default: StoryDefaultThumbnail,
  })
  thumbnail: string;

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
