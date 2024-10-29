import { z } from 'zod';
import { CreateChildDtoSchema } from './create-child.dto';
import { createZodDto } from 'nestjs-zod';

export const UpdateChildDtoSchema = CreateChildDtoSchema.partial().extend({
  childId: z.string(),
});

export class UpdateChildDto extends createZodDto(UpdateChildDtoSchema) {}
