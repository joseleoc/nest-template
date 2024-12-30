import { Gender, Language } from '@/types/general.types';
import { z } from 'zod';
import { NarratorAgeCategory } from '../schemas/narrators.schema';
import { createZodDto } from 'nestjs-zod';

export const FindOneNarratorDtoSchema = z.object({
  ageCategory: z.nativeEnum(NarratorAgeCategory),
  gender: z.nativeEnum(Gender),
  language: z.nativeEnum(Language).optional(),
});

export class FindOneNarratorDto extends createZodDto(
  FindOneNarratorDtoSchema,
) {}
