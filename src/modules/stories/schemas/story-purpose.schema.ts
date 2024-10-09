import { Prop, SchemaFactory } from '@nestjs/mongoose';

export class StoryPurpose {
  @Prop({ required: true, type: String, trim: true, default: '' })
  inputValue: string;

  @Prop({ required: false, type: String, trim: true, default: '' })
  selectedOption: string;
}

export const StoryPurposeSchema = SchemaFactory.createForClass(StoryPurpose);
