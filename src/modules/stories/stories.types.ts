import { Story, StoryDocument } from './schemas/stories.schema';
import { CloudStorageService } from '@/services/cloud-storage/cloud-storage.service';

export class PublicStory extends Story {
  id: string;
  constructor(story: StoryDocument) {
    const data = story.toObject();
    super();
    this.id = data._id.toString();
    Object.assign(this, data);
  }

  generateAudiosUrls(
    cloudStorageService: CloudStorageService,
  ): Promise<PublicStory> {
    return new Promise(
      async (resolve: (value: PublicStory) => void, reject) => {
        const promises = this.content.map((content) =>
          cloudStorageService.generatePresignedUrl(`audios/${content.audio}`),
        );
        await Promise.all(promises)
          .then((urls) => {
            this.content.forEach((content, index) => {
              content.audioUrl = urls[index];
            });
            resolve(this);
          })
          .catch((error) => reject(error));
      },
    );
  }
}
