import { PaginationDtoSchema } from '@/general.dto';
import { createZodDto } from 'nestjs-zod';

export const GetAllStoriesDtoSchema = PaginationDtoSchema;

export class GetAllStoriesDto extends createZodDto(PaginationDtoSchema) {}
