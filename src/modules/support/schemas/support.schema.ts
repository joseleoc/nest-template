import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { User } from '@/modules/users/schemas/user.schema';

export type SupportDocument = HydratedDocument<Support>;

@Schema({
  timestamps: true,
  toObject: { versionKey: false },
  toJSON: { versionKey: false },
})
export class Support {
  /** The id of the user */
  @Prop({ required: true, type: String, trim: true, ref: User.name })
  userId: string;

  //TODO: Add validation for type
  @Prop({ required: true, type: String })
  type: string;

  @Prop({ required: false, type: String })
  details?: string;
}

export const SupportSchema = SchemaFactory.createForClass(Support);

// Create index for the support collection
SupportSchema.index({ userId: 1 });
