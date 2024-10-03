import { ApiProperty } from '@nestjs/swagger';
import { UserLanguage } from '../schemas/user.schema';
import { PlanNames } from '@/modules/plans/schemas/plan.schema';

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
    example: 'FREE',
    required: false,
    enum: Object.values(PlanNames),
  })
  plan?: PlanNames;

  @ApiProperty({
    example: 'en',
    required: false,
    default: UserLanguage.EN,
    enum: Object.values(UserLanguage),
  })
  language?: UserLanguage;
}
