import { Injectable, Logger } from '@nestjs/common';
import { ElevenLabsClient } from 'elevenlabs';
import { createWriteStream } from 'node:fs';

@Injectable()
export class TextToSpeechService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly elevenLabsClient: ElevenLabsClient;
  private readonly logger = new Logger(TextToSpeechService.name);

  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor() {
    this.elevenLabsClient = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
  }

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  createAudioFileFromText = async (text: string): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
      this.elevenLabsClient
        .generate({
          voice: 'Rachel',
          model_id: 'eleven_turbo_v2_5',
          text,
        })
        .then((audio) => {
          //   const fileName = `${uuid()}.mp3`;
          const fileStream = createWriteStream(fileName);

          audio.pipe(fileStream);
          fileStream.on('finish', () => resolve(fileName)); // Resolve with the fileName
          fileStream.on('error', reject);
        })
        .catch((error) => {
          this.logger.error(
            '🚀 ~ file: text-to-speech.service.ts:45 ~ TextToSpeechService ~ returnnewPromise<string> ~ error:',
            error,
          );
          reject(error);
        });
    });
  };
}
