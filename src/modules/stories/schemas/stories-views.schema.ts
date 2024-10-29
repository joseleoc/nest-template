import { User } from '@/modules/users/schemas/user.schema';
import { Story } from './stories.schema';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type StoriesViewsDocument = HydratedDocument<StoriesViews>;

@Schema({
  timestamps: true,
  toObject: { versionKey: false },
  toJSON: { versionKey: false },
})
export class StoriesViews {
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

export const StoriesViewsSchema = SchemaFactory.createForClass(StoriesViews);

// Create indexes for efficient querying
StoriesViewsSchema.index({ userId: 1, storyId: 1 }, { unique: false }); // Compound index for retrieval by user and story

// Optional: Create an additional index for efficient user-based retrieval
// StoriesViewsSchema.index({ userId: 1 });  // Index for retrieving views by user
