import { Prop, SchemaFactory } from '@nestjs/mongoose';

export class StoryPurpose {
  @Prop({ required: true, type: String, trim: true })
  relatedTo: string;

  @Prop({ required: false, type: String, trim: true, default: '' })
  prompt: string;
}

export const StoryPurposeSchema = SchemaFactory.createForClass(StoryPurpose);
