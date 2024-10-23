import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudStorageService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly s3Client: S3Client;
  private logger = new Logger(CloudStorageService.name);
  private bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(private readonly configService: ConfigService) {
    this.checkEnvVariables();

    const s3_region = this.configService.get('AWS_REGION_NAME');
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      region: s3_region,
      forcePathStyle: true,
    });
  }

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  /**
   * Uploads an audio stream (Buffer) to the specified S3 bucket.
   *
   * @param audioStream - The audio stream data to be uploaded.
   * @returns A Promise that resolves to the unique key of the uploaded object in the S3 bucket.
   */
  uploadAudioStreamToS3(audioStream: Buffer) {
    return new Promise<string>(async (resolve, reject) => {
      const remotePath = `${uuid()}.mp3`;
      this.s3Client
        .send(
          new PutObjectCommand({
            Bucket: `${this.bucketName}`,
            Key: `audios/${remotePath}`,
            Body: audioStream,
            ContentType: 'audio/mpeg',
          }),
        )
        .then(() => {
          resolve(remotePath);
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  /**
   * Generates a pre-signed URL for an object in the specified S3 bucket.
   *
   * @param objectKey - The key of the object within the S3 bucket.
   * @returns A Promise that resolves to the pre-signed URL, allowing temporary access
   *          to the object for a limited time.
   */
  generatePresignedUrl = async (
    objectKey: string,
    expiresIn = 60 * 60 * 24,
  ) => {
    return new Promise<string>(async (resolve, reject) => {
      // Set the expiration time for the pre-signed URL to 3 days.
      const getObjectParams = {
        Bucket: this.bucketName,
        Key: objectKey,
        Expires: expiresIn,
      };
      const command = new GetObjectCommand(getObjectParams);
      getSignedUrl(this.s3Client, command, { expiresIn })
        .then((url) => {
          resolve(url);
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  };
  // --------------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------------
  private checkEnvVariables(): void {
    if (
      !this.configService.get('AWS_ACCESS_KEY_ID') ||
      !this.configService.get('AWS_SECRET_ACCESS_KEY') ||
      !this.configService.get('AWS_REGION_NAME') ||
      !this.configService.get('AWS_S3_BUCKET_NAME')
    ) {
      throw new Error(
        'One or more environment variables are not set. Please check your .env file.',
      );
    }
  }
}
