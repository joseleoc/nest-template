import { Language } from '@/types/general.types';
import { z } from 'zod';
import { NarratorAgeCategory } from '../schemas/narrators.schema';
import { Gender } from 'elevenlabs/api';
import { createZodDto } from 'nestjs-zod';

export const UpdateNarratorDtoSchema = z.object({
  id: z.string().trim(),
  name: z.string().trim().optional(),
  voiceId: z.string().trim().optional(),
  language: z.nativeEnum(Language).optional(),
  ageCategory: z.nativeEnum(NarratorAgeCategory).optional(),
  gender: z.nativeEnum(Gender).optional(),
});

export class UpdateNarratorDto extends createZodDto(UpdateNarratorDtoSchema) {}
