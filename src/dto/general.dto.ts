import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
// import { ApiProperty } from '@nestjs/swagger';

export const PaginationDtoSchema = z.object({
  page: z.number().min(0).default(0),
  limit: z.number().min(0).max(50).default(10),
  sort: z
    .union([z.literal('asc'), z.literal('desc')])
    .optional()
    .default('desc'),
});

export class PaginationDto extends createZodDto(PaginationDtoSchema) {}
