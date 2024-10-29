import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const StoryCounterDtoSchema = z.object({
  storyId: z.string(),
  userId: z.string(),
});

export class StoryCounterDto extends createZodDto(StoryCounterDtoSchema) {}
