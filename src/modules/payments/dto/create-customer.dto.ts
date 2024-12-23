import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCustomerDtoSchema = z.object({
  email: z.string().email().trim(),
  name: z.string().trim(),
  userId: z.string().trim(),
});

export class CreateCustomerDto extends createZodDto(CreateCustomerDtoSchema) {}
