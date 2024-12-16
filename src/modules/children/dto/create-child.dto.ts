import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Gender } from '@/general.types';

export const CreateChildDtoSchema = z.object({
  parentId: z.string(),
  name: z.string(),
  age: z.number(),
  gender: z.nativeEnum(Gender),
  description: z.string().optional().default(''),
});

export class CreateChildDto extends createZodDto(CreateChildDtoSchema) {}
