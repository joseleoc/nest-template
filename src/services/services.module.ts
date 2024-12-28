import { Module } from '@nestjs/common';
import { AiService } from './ai/ai.service';
import { TextToSpeechService } from './text-to-speech/text-to-speech.service';
import { CloudStorageService } from './cloud-storage/cloud-storage.service';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from './utils/utils.service';
import { StripeWebhookService } from '@golevelup/nestjs-stripe';

@Module({
  providers: [
    AiService,
    TextToSpeechService,
    CloudStorageService,
    ConfigService,
    UtilsService,
    StripeWebhookService,
  ],
  exports: [
    AiService,
    TextToSpeechService,
    CloudStorageService,
    UtilsService,
    StripeWebhookService,
  ],
})
export class ServicesModule {}
