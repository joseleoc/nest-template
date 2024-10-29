import { CreateUserDtoSchema } from './create-user.dto';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ChangePasswordDtoSchema = CreateUserDtoSchema.pick({
  password: true,
  email: true,
}).extend({
  newPassword: z.string().trim().min(6),
});

export class ChangePasswordDto extends createZodDto(ChangePasswordDtoSchema) {}
