import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PaymentIntentDtoSchema = z.object({
  amount: z.number().min(50, 'Amount must be equal or greater than 50 cents'),
  currency: z.nativeEnum({
    USD: 'usd',
  }),
  paymentMethodTypes: z.array(z.enum(['card'])),
});

export class PaymentIntentDto extends createZodDto(PaymentIntentDtoSchema) {}
