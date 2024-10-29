import { z } from 'zod';
import { Gender } from '@/general.types';
import { createZodDto } from 'nestjs-zod';

export const CharacterDtoSchema = z.object({
  description: z.string(),
  gender: z.nativeEnum(Gender),
});

export class CharacterDto extends createZodDto(CharacterDtoSchema) {}
