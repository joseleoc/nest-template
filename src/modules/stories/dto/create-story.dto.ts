import { Character } from '@/modules/characters/schemas/character.schema';
import { StoryPlace } from '@/modules/stories-places/schemas/story-place.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Schema } from 'mongoose';
import { Narrator } from '@/modules/narrators/schemas/narrators.schema';
import { StoryStyle } from '../schemas/stories.schema';

export class CreateStoryDto {
  @ApiProperty({ required: true, type: Schema.Types.ObjectId })
  userId: string;

  @ApiProperty({ required: true, type: Schema.Types.ObjectId })
  childId: string;

  @ApiProperty({ required: true, type: Character })
  mainCharacter: Character;

  @ApiProperty({ required: true, type: StoryPlace })
  storyPlace: StoryPlace;

  @ApiProperty({ required: true, type: Object })
  solveProblem: object;

  @ApiProperty({ required: true, type: String })
  storyHelp: string;

  @ApiProperty({ required: true, type: Narrator })
  storyNarrator: Narrator;

  @ApiProperty({ required: false, type: String, default: '' })
  finalDetails?: string;

  @ApiProperty({
    required: false,
    type: String,
    enum: Object.values(StoryStyle),
  })
  storyStyle: StoryStyle;

  @ApiProperty({ required: false, type: String, default: '' })
  language: string;
}
