import { PlanNames } from '@/modules/plans/schemas/plan.schema';
import { Language } from '@/general.types';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateUserDtoSchema = z.object({
  userId: z.string().trim(),
  userName: z.string().trim(),
  email: z.string().email().trim(),
  plan: z.nativeEnum(PlanNames).default(PlanNames.FREE_TIER),
  language: z.nativeEnum(Language).default(Language.EN),
});

export class CreateUserDto extends createZodDto(CreateUserDtoSchema) {}
