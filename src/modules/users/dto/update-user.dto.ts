import { z } from 'zod';
import { CreateUserDtoSchema } from './create-user.dto';
import { createZodDto } from 'nestjs-zod';

export const UpdateUserDtoSchema = CreateUserDtoSchema.partial().extend({
  userId: z.string(),
});

export class UpdateUserDto extends createZodDto(UpdateUserDtoSchema) {}
