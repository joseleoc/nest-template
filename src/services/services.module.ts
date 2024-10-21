import { Module } from '@nestjs/common';
import { AiService } from './ai/ai.service';
import { TextToSpeechService } from './text-to-speech/text-to-speech.service';
import { CloudStorageService } from './cloud-storage/cloud-storage.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    AiService,
    TextToSpeechService,
    CloudStorageService,
    ConfigService,
  ],
  exports: [AiService, TextToSpeechService, CloudStorageService],
})
export class ServicesModule {}
