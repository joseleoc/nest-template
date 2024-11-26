import { StoryStyle } from '../schemas/stories.schema';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Gender, Language } from '@/general.types';
import { CharacterDtoSchema } from '@/modules/characters/dto/character.dto';
import { NarratorAgeCategory } from '@/modules/narrators/schemas/narrators.schema';

export const CreateStoryDtoSchema = z.object({
  userId: z.string(),
  childId: z.string(),
  mainCharacter: CharacterDtoSchema,
  storyStyle: z.nativeEnum(StoryStyle),
  solveProblem: z.string().optional(),
  teachSomething: z.string().optional(),
  storyHelp: z.string(),
  storyNarrator: z.object({
    ageCategory: z.nativeEnum(NarratorAgeCategory),
    gender: z.nativeEnum(Gender),
  }),
  storyPlace: z.object({
    description: z.string(),
  }),
  finalDetails: z.string().optional().default(''),
  language: z.nativeEnum(Language),
  generateAudios: z.boolean().optional().default(true),
  generateImages: z.boolean().optional().default(true),
  paragraphsLength: z.number().optional().default(5),
});

export class CreateStoryDto extends createZodDto(CreateStoryDtoSchema) {}
