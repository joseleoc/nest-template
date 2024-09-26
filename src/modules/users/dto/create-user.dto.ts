import { ApiProperty } from '@nestjs/swagger';
import { Tier } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'john', required: true })
  userName: string;
  @ApiProperty({ example: 'changeme', required: true })
  password: string;
  @ApiProperty({ example: 'FREE', required: false })
  tier?: Tier;
}
