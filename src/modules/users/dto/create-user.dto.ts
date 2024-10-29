import { PlanNames } from '@/modules/plans/schemas/plan.schema';
import { Language } from '@/general.types';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateUserDtoSchema = z.object({
  userName: z.string().trim(),
  email: z.string().email().trim(),
  password: z.string().trim().min(6),
  plan: z.nativeEnum(PlanNames).default(PlanNames.MAGIC_TALES),
  language: z.nativeEnum(Language).default(Language.EN),
});

export class CreateUserDto extends createZodDto(CreateUserDtoSchema) {}
