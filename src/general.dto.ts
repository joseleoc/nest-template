import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ required: true, type: Number, default: 0 })
  page: number;
  @ApiProperty({ required: true, type: Number, default: 10 })
  limit: number;
}
