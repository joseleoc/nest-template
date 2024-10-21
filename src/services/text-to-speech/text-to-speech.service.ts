import { Injectable, Logger } from '@nestjs/common';
import { ElevenLabsClient } from 'elevenlabs';
// import { CloudStorageService } from '../cloud-storage/cloud-storage.service';
// import { createWriteStream } from 'node:fs';
// import { v4 as uuid } from 'uuid';
import { CloudStorageService } from '../cloud-storage/cloud-storage.service';

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
  constructor(private cloudStorageService: CloudStorageService) {
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

  // createAudioFileFromText = async (
  //   text: string,
  // ): Promise<{ fileName: string; duration: number }> => {
  //   return new Promise(async (resolve, reject) => {
  //     this.elevenLabsClient
  //       .generate({
  //         voice: 'Rachel',
  //         model_id: 'eleven_turbo_v2_5',
  //         text,
  //       })
  //       .then((audio) => {
  //         console.log(audio);
  //         const fileName = `${uuid()}.mp3`;
  //         console.log(fileName);
  //         const fileStream = createWriteStream(fileName);
  //         audio.pipe(fileStream);
  //         console.log(audio.readableLength);
  //         const duration = 0; // duration in seconds

  //         fileStream.on('finish', () => resolve({ fileName, duration })); // Resolve with the fileName
  //         fileStream.on('error', reject);
  //       })
  //       .catch((error) => {
  //         this.logger.error(
  //           '🚀 ~ file: text-to-speech.service.ts:45 ~ TextToSpeechService ~ returnnewPromise<string> ~ error:',
  //           error,
  //         );
  //         reject(error);
  //       });
  //   });
  // };

  createAudioStreamFromText = async (
    text: string,
  ): Promise<{ fileName: string; duration: number }> => {
    return new Promise(async (resolve, reject) => {
      console.log(text);
      this.elevenLabsClient
        .generate({
          voice: 'Bill',
          model_id: 'eleven_turbo_v2_5',
          text,
        })
        .then(async (audioStream) => {
          console.error('ELEVENLABS AUDIO STREAM', audioStream);
          // const chunks: Buffer[] = [];
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of audioStream) {
              chunks.push(chunk);
            }

            const content = Buffer.concat(chunks);
            this.cloudStorageService
              .uploadAudioStreamToS3(content)
              .then((res) => {
                resolve({ fileName: res, duration: 0 });
              })
              .catch((err) => {
                this.logger.error(err);
                reject(err);
              });
          } catch (error) {
            this.logger.error(error);
            reject(error);
          }
          // audioStream.on('data', (chunk) => {
          //   chunks.push(chunk);
          // });
          // audioStream.on('end', () => {
          //   const content = Buffer.concat(chunks);
          //   this.logger.log(content);
          //   this.cloudStorageService
          //     .uploadAudioStreamToS3(content)
          //     .then((fileName) => {
          //       resolve({ fileName, duration: 0 });
          //     })
          //     .catch((error) => {
          //       this.logger.error(error);
          //       reject(error);
          //     });
          // });

          // audioStream.on('error', (error) => {
          //   this.logger.error(error);
          //   reject(error);
          // });
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  };
}
