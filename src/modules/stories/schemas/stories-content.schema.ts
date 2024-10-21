import { Prop, SchemaFactory } from '@nestjs/mongoose';

export class StoryContent {
  @Prop({ required: true, type: String, default: '' })
  paragraph: string;

  @Prop({ required: true, type: String, default: '' })
  audio: string;

  @Prop({ required: true, type: String, default: '' })
  image: string;
}

export const StoryContentSchema = SchemaFactory.createForClass(StoryContent);
