import { PaginationDtoSchema } from '@/dto/general.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Report story dto
export const ReportStoryDtoSchema = z.object({
  storyId: z.string(),
  userId: z.string(),
  reason: z.string().max(265),
});

export class ReportStoryDto extends createZodDto(ReportStoryDtoSchema) {}

// Get reports dto
export const GetReportsDtoSchema = z.object({}).merge(PaginationDtoSchema);

export class GetReportsDto extends createZodDto(GetReportsDtoSchema) {}
