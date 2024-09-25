import { ApiProperty } from '@nestjs/swagger';
import { Tier } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'john', required: true })
  readonly userName: string;
  @ApiProperty({ example: 'changeme', required: true })
  readonly password: string;
  @ApiProperty({ example: 'FREE', required: false })
  readonly tier?: Tier;
}
