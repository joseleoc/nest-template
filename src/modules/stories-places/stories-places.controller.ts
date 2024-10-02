import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StoriesPlacesService } from './stories-places.service';
import { CreateStoriesPlaceDto } from './dto/create-stories-place.dto';
import { UpdateStoriesPlaceDto } from './dto/update-stories-place.dto';

@Controller('stories-places')
export class StoriesPlacesController {
  constructor(private readonly storiesPlacesService: StoriesPlacesService) {}

  @Post()
  create(@Body() createStoriesPlaceDto: CreateStoriesPlaceDto) {
    return this.storiesPlacesService.create(createStoriesPlaceDto);
  }

  @Get()
  findAll() {
    return this.storiesPlacesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storiesPlacesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStoriesPlaceDto: UpdateStoriesPlaceDto,
  ) {
    return this.storiesPlacesService.update(+id, updateStoriesPlaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storiesPlacesService.remove(+id);
  }
}
