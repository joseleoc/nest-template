export enum Plan {
  MAGIC_TALES = 'MAGIC_TALES',
  AMAZING_STORIES = 'AMAZING_STORIES',
  UNLIMITED_WORLDS = 'UNLIMITED_WORLDS',
}

export type PlanType = keyof typeof Plan;
