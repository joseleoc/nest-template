import { Plan, PlanNames } from './schemas/plan.schema';

export const DefaultPlans: Plan[] = [
  {
    name: PlanNames.MAGIC_TALES,
    limit: 5,
    price: 5.99,
    accessToText: true,
    accessToVoice: false,
    accessToImage: false,
  },
  {
    name: PlanNames.AMAZING_STORIES,
    limit: 15,
    price: 7.99,
    accessToText: true,
    accessToVoice: true,
    accessToImage: true,
  },
  {
    name: PlanNames.UNLIMITED_WORLDS,
    limit: Number.POSITIVE_INFINITY,
    price: 15.99,
    accessToText: true,
    accessToVoice: true,
    accessToImage: true,
  },
];
