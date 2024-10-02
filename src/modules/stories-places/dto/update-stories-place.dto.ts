import { PartialType } from '@nestjs/swagger';
import { CreateStoriesPlaceDto } from './create-stories-place.dto';

export class UpdateStoriesPlaceDto extends PartialType(CreateStoriesPlaceDto) {}
