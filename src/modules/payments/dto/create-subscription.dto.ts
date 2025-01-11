import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateSubscriptionDtoSchema = z.object({
  priceId: z.string().trim(),
  userId: z.string().trim(),
  customerId: z.string().trim(),
  planId: z.string().trim(),
});

export class CreateSubscriptionDto extends createZodDto(
  CreateSubscriptionDtoSchema,
) {}
