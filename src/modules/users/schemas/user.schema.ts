import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Tier } from '../entities/user.entity';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ immutable: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop()
  password?: string;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Tier.FREE })
  tier: Tier;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaName = 'User';

// export const UserSchema = new Schema({
//   userId: {
//     type: String,
//     required: false,
//   },
//   userName: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: false,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   tier: {
//     type: String,
//     required: true,
//     default: Tier.FREE,
//   },
// });
