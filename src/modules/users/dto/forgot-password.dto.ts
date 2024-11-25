import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ForgotPasswordDtoSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().trim().min(6),
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordDtoSchema) {}
