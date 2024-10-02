import { PartialType } from '@nestjs/swagger';
import { CreateNarratorDto } from './create-narrator.dto';

export class UpdateNarratorDto extends PartialType(CreateNarratorDto) {}
