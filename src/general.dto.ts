import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
// import { ApiProperty } from '@nestjs/swagger';

export const PaginationDtoSchema = z.object({
  page: z.number().min(0).default(0),
  limit: z.number().min(0).max(50).default(10),
});

export class PaginationDto extends createZodDto(PaginationDtoSchema) {}
