import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NarratorDocument = HydratedDocument<Narrator>;

@Schema()
export class Narrator {
  name: string;
  age: number;
  gender: string;
}

export const NarratorSchema = SchemaFactory.createForClass(Narrator);
