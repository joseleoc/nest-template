import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateChildDto } from './create-child.dto';

export class UpdateChildDto extends OmitType(PartialType(CreateChildDto), [
  'parentId',
]) {}
