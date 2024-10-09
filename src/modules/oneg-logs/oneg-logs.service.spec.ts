import { Test, TestingModule } from '@nestjs/testing';
import { OnegLogsService } from './oneg-logs.service';

describe('OnegLogsService', () => {
  let service: OnegLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnegLogsService],
    }).compile();

    service = module.get<OnegLogsService>(OnegLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
