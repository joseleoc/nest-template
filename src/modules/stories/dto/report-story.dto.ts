import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ReportStoryDtoSchema = z.object({
  storyId: z.string(),
  userId: z.string(),
  reason: z.string().max(265),
});

export class ReportStoryDto extends createZodDto(ReportStoryDtoSchema) {}
