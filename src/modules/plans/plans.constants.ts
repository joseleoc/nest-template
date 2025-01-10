import appConfig from '@/config/app.config';
import { Plan, PlanNames } from './schemas/plan.schema';
const isProduction = appConfig().GENERAL.NODE_ENV === 'production';

export const DefaultPlans: Plan[] = [
  {
    name: PlanNames.FREE_TIER,
    creditsLimit: 0,
    price: 0,
    accessToText: true,
    accessToVoice: false,
    accessToImage: false,
    priceId: isProduction
      ? 'price_1Qb47MDtWVIpSmG73aI9LR7K'
      : 'price_1Qb43mDtWVIpSmG7N9uaAZFH',
  },
  {
    name: PlanNames.LOW_TIER,
    creditsLimit: 5,
    price: 5.99,
    accessToText: true,
    accessToVoice: false,
    accessToImage: false,
    priceId: isProduction
      ? 'price_1QY9w8DtWVIpSmG7TfvlVw2H'
      : 'price_1QZKhuDtWVIpSmG7HM1exAxD',
  },
  {
    name: PlanNames.MEDIUM_TIER,
    creditsLimit: 15,
    price: 7.99,
    accessToText: true,
    accessToVoice: true,
    accessToImage: true,
    priceId: isProduction
      ? 'price_1QY9wwDtWVIpSmG7CpYMTVqp'
      : 'price_1QZKyVDtWVIpSmG7P5KXjx4U',
  },
  {
    name: PlanNames.HIGH_TIER,
    creditsLimit: Number.POSITIVE_INFINITY,
    price: 15.99,
    accessToText: true,
    accessToVoice: true,
    accessToImage: true,
    priceId: isProduction
      ? 'price_1QY9xZDtWVIpSmG7Q2kMojSD'
      : 'price_1QZKyhDtWVIpSmG7K09WFxk0',
  },
];
