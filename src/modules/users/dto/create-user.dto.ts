import { ApiProperty } from '@nestjs/swagger';

import { PlanNames } from '@/modules/plans/schemas/plan.schema';
import { Language } from '@/general.types';

export class CreateUserDto {
  @ApiProperty({ example: 'john', required: true, type: 'string' })
  userName: string;
  @ApiProperty({
    example: 'johndoea@email.com',
    required: true,
    type: 'string',
  })
  email: string;
  @ApiProperty({ example: 'changeme', required: true, type: 'string' })
  password: string;
  @ApiProperty({
    example: PlanNames.MAGIC_TALES,
    required: true,
    enum: Object.values(PlanNames),
  })
  plan: PlanNames;

  @ApiProperty({
    example: 'en',
    required: false,
    default: Language.EN,
    enum: Object.values(Language),
  })
  language?: Language;
}
