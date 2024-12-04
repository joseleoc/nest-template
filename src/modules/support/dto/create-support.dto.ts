import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateSupportDtoSchema = z.object({
  userId: z.string(),
  //TODO: Add validation for type
  type: z.string(),
  description: z.string(),
});

export class CreateSupportDto extends createZodDto(CreateSupportDtoSchema) {}
