import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { StoryPurpose } from './story-purpose.schema';
import { StoryContent } from './stories-content.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Child } from '@/modules/children/schemas/child.schema';
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

  @Prop({ required: true, type: Array<StoryContent> })
  content: StoryContent[];

  @Prop({ required: true, type: String, trim: true })
  summary: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
  })
  character: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: Object.values(StoryStyle),
  })
  storyStyle: keyof typeof StoryStyle;

  @Prop({ required: false, type: StoryPurpose })
  solveProblem?: StoryPurpose;

  @Prop({ required: false, type: StoryPurpose })
  teachSomething?: StoryPurpose;

  @Prop({ required: true, type: String, trim: true, default: '' })
  storyHelp: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    trim: true,
    ref: Narrator.name,
    index: true,
  })
  narratorId: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
  })
  place: string;

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
  userId: string;

  @Prop({ required: false, type: String, default: '' })
  finalDetails?: string;

  @Prop({ required: false, type: Number, default: 0 })
  readingTime?: number;

  @Prop({ required: false, type: Number, default: 0 })
  likesCount?: number;

  @Prop({ required: false, type: Number, default: 0 })
  viewsCount?: number;

  @Prop({ required: false, type: Number, default: 0 })
  sharesCount?: number;

  @Prop({ required: false, type: Boolean, default: false })
  deleted?: boolean;
}

export const StorySchema = SchemaFactory.createForClass(Story);

// Create indexes for efficient querying
StorySchema.index({ userId: 1 }, { unique: false }); // Compound index for retrieval by userId
StorySchema.index({ childId: 1 }, { unique: false }); // Compound index for retrieval by childId
