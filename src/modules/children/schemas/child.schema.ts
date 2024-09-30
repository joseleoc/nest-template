import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema } from 'mongoose';

export enum Genders {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export type ChildDocument = HydratedDocument<Child>;

@Schema()
export class Child {
  @Prop({
    required: true,
    type: MongoSchema.Types.ObjectId,
    ref: User.name,
    trim: true,
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
    enum: Object.values(Genders),
  })
  gender: string;

  constructor(data: Child) {
    Object.assign(this, data);
  }
}

export const ChildSchema = SchemaFactory.createForClass(Child);
