import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '../schemas/child.schema';

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
    enum: Object.values(Genders),
    type: 'string',
  })
  gender: string;
}
