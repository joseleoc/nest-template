import { Module } from '@nestjs/common';
import { StoriesPlacesService } from './stories-places.service';
import { StoriesPlacesController } from './stories-places.controller';

@Module({
  controllers: [StoriesPlacesController],
  providers: [StoriesPlacesService],
})
export class StoriesPlacesModule {}
