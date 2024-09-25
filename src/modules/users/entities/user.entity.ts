import { Document } from 'mongoose';

export interface User extends Document {
  readonly _id: string;
  readonly userName: string;
  readonly password?: string;
  readonly createdAt?: Date;
  readonly tier: Tier;
}

export enum Tier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export type TierType = keyof typeof Tier;
