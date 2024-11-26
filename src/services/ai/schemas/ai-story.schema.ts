import { z } from 'zod';

export const AiStorySchema = z.object({
  title: z.string(),
  summary: z.string(),
  content: z.array(z.string()),
  contentImageDescription: z.array(z.string()),
  scenarioDescription: z.string(),
  character: z.string(),
});

export type AiStory = z.infer<typeof AiStorySchema>;
