import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUserDtoSchema = z.object({
  userName: z.string().min(1).max(50),
  password: z.string().min(6).max(50),
});

export class CreateUserDto extends createZodDto(CreateUserDtoSchema) {}
