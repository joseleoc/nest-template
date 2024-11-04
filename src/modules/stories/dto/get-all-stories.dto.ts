import { PaginationDtoSchema } from '@/general.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetAllStoriesDtoSchema = z.object({}).merge(PaginationDtoSchema);

export class GetAllStoriesDto extends createZodDto(PaginationDtoSchema) {}
