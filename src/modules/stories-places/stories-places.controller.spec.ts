import { Test, TestingModule } from '@nestjs/testing';
import { StoriesPlacesController } from './stories-places.controller';
import { StoriesPlacesService } from './stories-places.service';

describe('StoriesPlacesController', () => {
  let controller: StoriesPlacesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoriesPlacesController],
      providers: [StoriesPlacesService],
    }).compile();

    controller = module.get<StoriesPlacesController>(StoriesPlacesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
