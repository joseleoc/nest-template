import { User } from '@/modules/users/schemas/user.schema';
import { Story } from './stories.schema';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type StoriesLikesDocument = HydratedDocument<StoriesLikes>;

@Schema({
  timestamps: true,
  toObject: { versionKey: false },
  toJSON: { versionKey: false },
})
export class StoriesLikes {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Story.name,
    required: true,
  })
  storyId: string;
}

export const StoriesLikesSchema = SchemaFactory.createForClass(StoriesLikes);
