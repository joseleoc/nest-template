import { Test, TestingModule } from '@nestjs/testing';
import { StoriesPlacesService } from './stories-places.service';

describe('StoriesPlacesService', () => {
  let service: StoriesPlacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoriesPlacesService],
    }).compile();

    service = module.get<StoriesPlacesService>(StoriesPlacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
