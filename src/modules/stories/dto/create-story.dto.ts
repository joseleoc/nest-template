import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Gender, Language } from '@/general.types';
import { NarratorAgeCategory } from '@/modules/narrators/schemas/narrators.schema';
import {
  Focus,
  GeneralPurpose,
  MainCharacter,
  StoryCore,
  StoryScenario,
  StoryStyle,
} from '../types/stories.types';

export const CreateStoryDtoSchema = z.object({
  userId: z.string(),
  childId: z.string(),
  mainCharacter: z.nativeEnum(MainCharacter),
  mainCharacterDescription: z.string().optional().default(''),
  storyStyle: z.nativeEnum(StoryStyle),
  core: z.nativeEnum(StoryCore),
  purpose: z.nativeEnum(GeneralPurpose),
  purposeDescription: z.string().optional().default(''),
  storyNarrator: z.object({
    ageCategory: z.nativeEnum(NarratorAgeCategory),
    gender: z.nativeEnum(Gender),
  }),
  scenario: z.nativeEnum(StoryScenario),
  scenarioDescription: z.string().optional().default(''),
  focus: z.nativeEnum(Focus).optional(),
  focusDescription: z.string().optional().default(''),
  finalDetails: z.string().optional().default(''),
  language: z.nativeEnum(Language),
  generateAudios: z.boolean().optional().default(true),
  generateImages: z.boolean().optional().default(true),
  paragraphsLength: z.number().optional().default(5),
});

export class CreateStoryDto extends createZodDto(CreateStoryDtoSchema) {}
