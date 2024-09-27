import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChildDocument = HydratedDocument<Child>;

@Schema()
export class Child {
  @Prop({ required: true, type: String, trim: true })
  name: string;

  @Prop({ required: true, type: Number, trim: true, min: 0, max: 100 })
  age: number;

  @Prop({ required: true, type: String, trim: true })
  gender: string;
}

export const ChildSchema = SchemaFactory.createForClass(Child);
