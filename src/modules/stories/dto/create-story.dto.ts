import { ApiProperty } from '@nestjs/swagger';
import { Schema } from 'mongoose';

export class CreateStoryDto {
  @ApiProperty({ required: true, type: Schema.Types.ObjectId })
  userId: string;
}
