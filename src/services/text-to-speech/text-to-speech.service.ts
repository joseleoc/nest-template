import { Injectable, Logger } from '@nestjs/common';
import { ElevenLabsClient } from 'elevenlabs';
// import { CloudStorageService } from '../cloud-storage/cloud-storage.service';
import { createWriteStream } from 'node:fs';
import { v4 as uuid } from 'uuid';

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
    // private cloudStorageService: CloudStorageService
    this.elevenLabsClient = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // setTimeout(() => {
    //   this.createAudioFileFromText('Hello, world!').then(async (file) => {
    //     console.log(file);

    //     const s3path =
    //       await this.cloudStorageService.uploadAudioStreamToS3(stream);
    //     const presignedUrl =
    //       await this.cloudStorageService.generatePresignedUrl(s3path);
    //     console.log('Presigned URL:', presignedUrl);
    //   });
    // }, 3000);
  }

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------

  createAudioFileFromText = async (
    text: string,
  ): Promise<{ fileName: string; duration: number }> => {
    return new Promise(async (resolve, reject) => {
      this.elevenLabsClient
        .generate({
          voice: 'Rachel',
          model_id: 'eleven_turbo_v2_5',
          text,
        })
        .then((audio) => {
          console.log(audio);
          const fileName = `${uuid()}.mp3`;
          console.log(fileName);
          const fileStream = createWriteStream(fileName);
          audio.pipe(fileStream);
          console.log(audio.readableLength);
          const duration = 0; // duration in seconds

          fileStream.on('finish', () => resolve({ fileName, duration })); // Resolve with the fileName
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

  createAudioStreamFromText = async (
    text: string,
  ): Promise<{ audioBuffer: Buffer; duration: number }> => {
    return new Promise(async (resolve, reject) => {
      this.elevenLabsClient
        .generate({
          voice: 'Rachel',
          model_id: 'eleven_turbo_v2_5',
          text,
        })
        .then((audioStream) => {
          const chunks: Buffer[] = [];
          audioStream.on('data', (chunk) => {
            chunks.push(chunk);
          });
          audioStream.on('end', () => {
            const content = Buffer.concat(chunks);
            resolve({ audioBuffer: content, duration: 0 });
          });

          audioStream.on('error', (error) => {
            this.logger.error(error);
            reject(error);
          });
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  };
}
