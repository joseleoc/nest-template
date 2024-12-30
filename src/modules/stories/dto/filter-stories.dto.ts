import { PaginationDtoSchema } from '@/dto/general.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  Focus,
  GeneralPurpose,
  MainCharacter,
  StoryCore,
  StoryScenario,
  StoryStyle,
} from '../types/stories.types';
import { Gender } from '@/types/general.types';
import { NarratorAgeCategory } from '@/modules/narrators/schemas/narrators.schema';

enum sortByOptions {
  'CORE' = 'core',
  'PURPOSE' = 'purpose',
  'SCENARIO' = 'scenario',
  'character' = 'character',
  'NARRATOR' = 'narrator',
  'TITLE' = 'title',
}

export const FilterStoriesDtoSchema = z
  .object({
    title: z.string().optional(),
    storyStyle: z.nativeEnum(StoryStyle).optional(),
    core: z.nativeEnum(StoryCore).optional(),
    purpose: z.nativeEnum(GeneralPurpose).optional(),
    narrator: z
      .object({
        gender: z.nativeEnum(Gender),
        ageCategory: z.nativeEnum(NarratorAgeCategory),
      })
      .optional(),
    character: z.nativeEnum(MainCharacter).optional(),
    characterGender: z.nativeEnum(Gender).optional(),
    scenario: z.nativeEnum(StoryScenario).optional(),
    sortBy: z.nativeEnum(sortByOptions).optional().default(sortByOptions.TITLE),
    focus: z.nativeEnum(Focus).optional(),
  })

  .merge(PaginationDtoSchema);

export class FilterStoriesDto extends createZodDto(FilterStoriesDtoSchema) {}
