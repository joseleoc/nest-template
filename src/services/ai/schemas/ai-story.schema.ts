import { z } from 'zod';

export const AiStorySchema = z.object({
  title: z.string(),
  summary: z.string(),
  content: z.array(z.string()),
  placeDescription: z.string(),
});

export type AiStory = z.infer<typeof AiStorySchema>;
