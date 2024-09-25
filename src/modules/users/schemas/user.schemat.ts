import { Schema } from 'mongoose';
import { Tier } from '../entities/user.entity';

export const UserSchema = new Schema({
  userId: {
    type: String,
    required: false,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tier: {
    type: String,
    required: true,
    default: Tier.FREE,
  },
});
