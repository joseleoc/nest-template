import { z } from 'zod';
import { CreateUserDtoSchema } from './create-user.dto';
import { createZodDto } from 'nestjs-zod';

export const UpdateUserDtoSchema = CreateUserDtoSchema.omit({ password: true })
  .partial()
  .extend({
    userId: z.string(),
  });

export class UpdateUserDto extends createZodDto(UpdateUserDtoSchema) {}
