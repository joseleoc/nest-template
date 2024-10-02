import { SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type characterDocument = HydratedDocument<Character>;

export class Character {
  name: string;
  age: number;
  gender: string;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);
