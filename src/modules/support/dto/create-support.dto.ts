import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateSupportDtoSchema = z.object({
  userId: z.string(),
  type: z.string(),
  details: z.string().optional(),
});

export class CreateSupportDto extends createZodDto(CreateSupportDtoSchema) {}
