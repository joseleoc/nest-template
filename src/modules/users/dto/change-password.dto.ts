import { CreateUserDtoSchema } from './create-user.dto';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ChangePasswordDtoSchema = CreateUserDtoSchema.pick({
  email: true,
}).extend({
  password: z.string().trim().min(0),
  newPassword: z.string().trim().min(6),
});

export class ChangePasswordDto extends createZodDto(ChangePasswordDtoSchema) {}
