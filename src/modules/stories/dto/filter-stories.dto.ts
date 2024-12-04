import { PaginationDtoSchema } from '@/general.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const FilterStoriesDtoSchema = z.object({}).merge(PaginationDtoSchema);

export class FilterStoriesDto extends createZodDto(FilterStoriesDtoSchema) {}
