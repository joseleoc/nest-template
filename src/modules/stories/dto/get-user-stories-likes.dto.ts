import { PaginationDtoSchema } from '@/dto/general.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const getUserStoriesLikesDtoSchema = z
  .object({
    userId: z.string(),
  })
  .merge(PaginationDtoSchema);

export class GetUserStoriesLikesDto extends createZodDto(
  getUserStoriesLikesDtoSchema,
) {}
