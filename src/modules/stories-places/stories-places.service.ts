import { Injectable } from '@nestjs/common';
import { CreateStoriesPlaceDto } from './dto/create-stories-place.dto';
import { UpdateStoriesPlaceDto } from './dto/update-stories-place.dto';

@Injectable()
export class StoriesPlacesService {
  create(createStoriesPlaceDto: CreateStoriesPlaceDto) {
    return 'This action adds a new storiesPlace';
  }

  findAll() {
    return `This action returns all storiesPlaces`;
  }

  findOne(id: number) {
    return `This action returns a #${id} storiesPlace`;
  }

  update(id: number, updateStoriesPlaceDto: UpdateStoriesPlaceDto) {
    return `This action updates a #${id} storiesPlace`;
  }

  remove(id: number) {
    return `This action removes a #${id} storiesPlace`;
  }
}
