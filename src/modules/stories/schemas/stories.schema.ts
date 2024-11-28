import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { StoryContent } from './stories-content.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Child } from '@/modules/children/schemas/child.schema';
import { Narrator } from '@/modules/narrators/schemas/narrators.schema';
import {
  GeneralPurpose,
  StoryScenario,
  StoryCore,
  StoryStyle,
  Focus,
} from '../types/stories.types';

export const StoryDefaultThumbnail = 'story-default-thumbnail.png';

export type StoryDocument = HydratedDocument<Story>;

@Schema({
  timestamps: true,
  toObject: { versionKey: false },
  toJSON: { versionKey: false },
})
export class Story {
  /** The title of the story */
  @Prop({ required: true, type: String, trim: true })
  title: string;

  /** The content of the story, containing the audios, images and text of each paragraph */
  @Prop({ required: true, type: Array<StoryContent> })
  content: StoryContent[];

  /** The description of the images in the content section, each element is related to the same index in the content array */
  @Prop({ required: true, type: Array<string>, default: [] })
  contentImageDescription: string[];

  /** The summary of the story */
  @Prop({ required: true, type: String, trim: true })
  summary: string;

  /** The character of the story */
  @Prop({
    required: true,
    type: String,
    trim: true,
  })
  character: string;

  @Prop({ required: false, type: String, trim: true })
  characterDescription?: string;

  /** The style of the story */
  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: Object.values(StoryStyle),
  })
  storyStyle: keyof typeof StoryStyle;

  /** The core of the story */
  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: Object.values(StoryCore),
  })
  core: keyof typeof StoryCore;

  @Prop({
    required: true,
    type: String,
    enum: GeneralPurpose,
  })
  purpose: keyof typeof GeneralPurpose;

  @Prop({ required: false, type: String, trim: true })
  purposeDescription?: string;

  /** The id of the narrator */
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    trim: true,
    ref: Narrator.name,
    index: true,
  })
  narratorId: string;

  /** The scenario of the story */
  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: Object.values(StoryScenario),
  })
  scenario: keyof typeof StoryScenario;

  @Prop({ required: false, type: String, trim: true })
  scenarioDescription?: string;

  /** The focus of the story */
  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: Object.values(Focus),
  })
  focus: keyof typeof Focus;

  @Prop({ required: false, type: String, trim: true })
  focusDescription?: string;

  /** The thumbnail of the story */
  @Prop({
    required: false,
    type: String,
    trim: true,
    default: StoryDefaultThumbnail,
  })
  thumbnail?: string;

  /** The id of the child */
  @Prop({ required: false, type: String, trim: true, ref: Child.name })
  childId?: string;

  /** The id of the user */
  @Prop({ required: true, type: String, trim: true, ref: User.name })
  userId: string;

  /** The final details of the story */
  @Prop({ required: false, type: String, default: '' })
  finalDetails?: string;

  /** The reading time of the story */
  @Prop({ required: false, type: Number, default: 0 })
  readingTime?: number;

  /** The number of likes of the story */
  @Prop({ required: false, type: Number, default: 0 })
  likesCount?: number;

  /** The number of views of the story */
  @Prop({ required: false, type: Number, default: 0 })
  viewsCount?: number;

  /** The number of shares of the story */
  @Prop({ required: false, type: Number, default: 0 })
  sharesCount?: number;

  /** Whether the story is deleted or not */
  @Prop({ required: false, type: Boolean, default: false })
  deleted?: boolean;
}

export const StorySchema = SchemaFactory.createForClass(Story);

// Create indexes for efficient querying
StorySchema.index({ userId: 1 }, { unique: false }); // Compound index for retrieval by userId
StorySchema.index({ childId: 1 }, { unique: false }); // Compound index for retrieval by childId
