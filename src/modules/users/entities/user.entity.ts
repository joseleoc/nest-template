export enum Plan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export type PlanType = keyof typeof Plan;

export enum UserLanguage {
  EN = 'en',
  ES = 'es',
}
