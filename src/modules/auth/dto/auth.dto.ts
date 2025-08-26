import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginDtoSchema = z.object({
  userName: z.string().min(2).max(50),
  password: z.string().min(6).max(50),
});

export class LoginDTO extends createZodDto(LoginDtoSchema) {}
