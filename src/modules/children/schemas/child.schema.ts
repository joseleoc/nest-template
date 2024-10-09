import { Gender } from '@/general.types';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';

export type ChildDocument = HydratedDocument<Child>;

@Schema({
  toObject: {
    versionKey: false,
  },
  toJSON: {
    versionKey: false,
  },
})
export class Child {
  @Prop({
    required: true,
    type: MongoSchema.Types.ObjectId,
    ref: User.name,
    trim: true,
    immutable: true,
  })
  parentId: string;

  @Prop({ required: true, type: String, trim: true })
  name: string;

  @Prop({ required: true, type: Number, trim: true, min: 0, max: 100 })
  age: number;

  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: Object.values(Gender),
  })
  gender: Gender;

  @Prop({
    type: Boolean,
    default: false,
  })
  deleted: boolean;

  constructor(data: Child) {
    Object.assign(this, data);
  }
}

export const ChildSchema = SchemaFactory.createForClass(Child);
