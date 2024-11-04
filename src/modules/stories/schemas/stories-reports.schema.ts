import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type StoriesReportDocument = HydratedDocument<StoriesReports>;

@Schema({
  timestamps: true,
  toObject: { versionKey: false },
  toJSON: { versionKey: false },
})
export class StoriesReports {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, trim: true })
  storyId: string;
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, trim: true })
  userId: string;
  @Prop({ required: true, type: String, trim: true, maxlength: 265 })
  reason: string;
}

export const StoriesReportsSchema =
  SchemaFactory.createForClass(StoriesReports);

// Create indexes for efficient querying
StoriesReportsSchema.index({ storyId: 1, userId: 1 }, { unique: false }); // Compound index for retrieval by story and user
