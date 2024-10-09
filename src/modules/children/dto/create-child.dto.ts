import { Gender } from '@/general.types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChildDto {
  @ApiProperty({ required: true, example: 'id', type: 'string' })
  parentId: string;

  @ApiProperty({ required: true, example: 'John', type: 'string' })
  name: string;

  @ApiProperty({ required: true, example: '4', type: 'number' })
  age: number;

  @ApiProperty({
    required: true,
    example: 'male / female / other',
    enum: Object.values(Gender),
    type: 'string',
  })
  gender: Gender;
}
