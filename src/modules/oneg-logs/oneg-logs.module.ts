import { Module } from '@nestjs/common';
import { OnegLogsService } from './oneg-logs.service';

@Module({
  providers: [OnegLogsService]
})
export class OnegLogsModule {}
