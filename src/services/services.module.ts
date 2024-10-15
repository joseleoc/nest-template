import { Module } from '@nestjs/common';
import { AiService } from './ai/ai.service';
import { TextToSpeechService } from './text-to-speech/text-to-speech.service';

@Module({
  providers: [AiService, TextToSpeechService],
  exports: [AiService, TextToSpeechService],
})
export class ServicesModule {}
