import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PaymentSheetDtoSchema = z.object({
  amount: z.number(),
  currency: z
    .nativeEnum({
      USD: 'usd',
    })
    .optional()
    .default('usd'),
});

export class PaymentSheetDto extends createZodDto(PaymentSheetDtoSchema) {}
