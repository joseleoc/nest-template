import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Gender, Language } from '@/general.types';
import { NarratorAgeCategory } from '@/modules/narrators/schemas/narrators.schema';
import {
  StoryCore,
  StoryPurpose,
  StoryScenario,
  StoryStyle,
} from '../types/stories.types';

export const CreateStoryDtoSchema = z.object({
  userId: z.string(),
  childId: z.string(),
  mainCharacter: z.string(),
  storyStyle: z.nativeEnum(StoryStyle),
  core: z.nativeEnum(StoryCore),
  purpose: z.nativeEnum(StoryPurpose),
  storyNarrator: z.object({
    ageCategory: z.nativeEnum(NarratorAgeCategory),
    gender: z.nativeEnum(Gender),
  }),
  scenario: z.nativeEnum(StoryScenario),
  finalDetails: z.string().optional().default(''),
  language: z.nativeEnum(Language),
  generateAudios: z.boolean().optional().default(true),
  generateImages: z.boolean().optional().default(true),
  paragraphsLength: z.number().optional().default(5),
});

export class CreateStoryDto extends createZodDto(CreateStoryDtoSchema) {}
