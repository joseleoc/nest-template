import { ElevenLabsClient } from 'elevenlabs';
import { Injectable, Logger } from '@nestjs/common';
import { CloudStorageService } from '../cloud-storage/cloud-storage.service';
import { Narrator } from '@/modules/narrators/schemas/narrators.schema';

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
    this.elevenLabsClient = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
  }
  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------

  /**
   * Generates an audio stream from a list of paragraphs. The audios are returned in the same order as the paragraphs and are uploaded to the cloud storage.
   * @param params.paragraphs - The list of paragraphs to generate the audio stream from
   * @returns A Promise that resolves to an object with the file names and the duration of the audio stream
   */
  createAudioStreamFromText = async (params: {
    paragraphs: string[];
    narrator: Narrator;
  }): Promise<{ fileNames: string[]; duration: number }> => {
    return new Promise(async (resolve) => {
      const { paragraphs, narrator } = params;
      const audios: { buffer: Buffer; index: number }[] = [];
      for await (const [i, text] of paragraphs.entries()) {
        const isFirstParagraph = i === 0;
        const isLastParagraph = i === paragraphs.length - 1;
        const previous_text = isFirstParagraph
          ? ''
          : paragraphs.slice(0, i).join(' ');
        const next_text = isLastParagraph
          ? ''
          : paragraphs.slice(i + 1, paragraphs.length).join(' ');
        // Generates the audio stream for the current paragraph. Giving the previous and next paragraphs as context.
        const audioStream = await this.elevenLabsClient.generate({
          text,
          previous_text,
          next_text,
          voice: narrator?.name || 'Bill',
          model_id: 'eleven_turbo_v2_5',
          stream: true,
        });

        // Concatenates the audio stream chunks into a single buffer
        const chunks: Buffer[] = [];
        try {
          for await (const chunk of audioStream) {
            chunks.push(chunk);
          }

          const content = Buffer.concat(chunks);
          audios.push({ buffer: content, index: i });
        } catch (error) {
          this.logger.error(error);
        }
      }

      // Creates an array of promises, one for each audio, where each promise uploads the audio to the cloud storage
      const uploadPromises = audios.map(({ buffer, index }) => {
        return new Promise(
          (
            resolve: (value: { fileName: string; index: number }) => void,
            reject,
          ) => {
            this.cloudStorageService
              .uploadAudioStreamToS3(buffer)
              .then((res) => {
                resolve({ fileName: res, index });
              })
              .catch((err) => {
                this.logger.error(err);
                reject(err);
              });
          },
        );
      });

      // Executes the upload promises in parallel
      Promise.all(uploadPromises)
        .then((uploadRes) => {
          const fileNames = new Array(paragraphs.length);

          uploadRes.forEach((res) => {
            fileNames[res.index] = res.fileName;
          });
          // Resolves the promise with the file names and duration
          resolve({ fileNames, duration: 0 });
        })
        .catch((error) => {
          this.logger.error(error);
        });
    });
  };
}
