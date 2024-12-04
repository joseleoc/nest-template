import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateSupportTypeDtoSchema = z.object({
  type: z.string(),
  details: z.string(),
  label: z.string(),
});

export class CreateSupportTypeDto extends createZodDto(
  CreateSupportTypeDtoSchema,
) {}
