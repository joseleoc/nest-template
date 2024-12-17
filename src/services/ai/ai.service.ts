import OpenAI from 'openai';
import { chunk } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { zodResponseFormat } from 'openai/helpers/zod';
import { AiStory, AiStorySchema } from './schemas/ai-story.schema';
import { CreateStoryDto } from '../../modules/stories/dto/create-story.dto';
import { User } from '../../modules/users/schemas/user.schema';
import { PublicUser } from '../../modules/users/types/users.types';
import { PublicChild } from '../../modules/children/types/children.types';
import { CloudStorageService } from '../cloud-storage/cloud-storage.service';
import { GeneralPurpose } from '@/modules/stories/types/stories.types';
@Injectable()
export class AiService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(private cloudStorageService: CloudStorageService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      project: process.env.OPENAI_PROJECT,
      organization: process.env.OPENAI_ORGANIZATION,
    });
  }
  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  createStory(params: {
    prompt: CreateStoryDto;
    user: User | PublicUser;
    child?: PublicChild | null;
  }): Promise<AiStory> {
    return new Promise((resolve: (value: AiStory) => void, reject) => {
      // En los prompts debe ser por punto a punto, concretos.
      const { prompt, user, child } = params;
      this.openai.chat.completions
        .create({
          model: 'gpt-4o',
          response_format: zodResponseFormat(AiStorySchema, 'story'),
          messages: [
            {
              role: 'system',
              content:
                'You are a story assistant designed to output JSON. You will only output the JSON, and nothing else.',
            },
            {
              role: 'user',
              content: `
              Create a story. 
              The story should be in ${prompt.language} language.
              Write a story that is at least 2 or more minutes long when read aloud, it should have a clear beginning, a rising action that builds tension, a climax where the conflict reaches its peak, a falling action that leads to resolution, and a satisfying conclusion.
              our story should have at least ${prompt.paragraphsLength} paragraphs to allow for a well-developed plot and characters. Use as many paragraphs as needed to tell your story effectively.
              The tone of the story should be appropriate for all ages, meaning it should be free from violence or themes that are not acceptable for young readers.
              Create a story that is engaging, entertaining, and educational.
              This should be a ${prompt.storyStyle} story.
              ${prompt.finalDetails && `Take in great consideration this details for the story and try to include every aspect of them: "${prompt.finalDetails}".`}
              Main character is ${prompt.mainCharacter}, ${prompt.mainCharacterDescription}, in the contents fields don't describe the character with high details but in the characterDescription field provide a detailed description of the character's appearance, including the skin, clothes and eye colors, provide the character's age, height, weight, name, and any other relevant information.
              The story should take place in ${prompt.scenario}, ${prompt.scenarioDescription}; Provide a detailed and vivid description of the place, including the atmosphere, surroundings, and key features that set the scene. In the content section, don't describe the setting's appearance, the only section that should be high detailed is the place section, in the place section describe the setting in detail suitable for an AI to generate an image the description should be at least 50 characters and no more than 200 characters.
              The story should be focused in ${prompt.focus}, ${prompt.focusDescription}.
              The story should be about ${prompt.core}, ${prompt.purpose != GeneralPurpose.OTHER ? `focus in ${prompt.purpose}` : ''} ${prompt.purposeDescription != '' ? `The purpose should be centered in ${prompt.purposeDescription}` : ''}.
              The summary of the story should be engaging and interesting for young people and adults and should be no more than 50 words.
              `,
            },
          ],
        })
        .then((completion) => {
          let story: AiStory;
          if (typeof completion.choices[0].message.content === 'string') {
            story = JSON.parse(completion.choices[0].message.content);
          } else {
            story = completion.choices[0].message.content as any;
          }
          resolve(story);
          this.logger.log({
            message: 'Story created successfully',
            AICompletion: {
              id: completion.id,
              object: completion.object,
              created: completion.created,
              model: completion.model,
              usage: completion.usage,
            },
          });
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  /**
   * Generates the images for the story.
   * @param params.story - The story to generate the images for.
   * @param params.createAllImages - Whether to create all the images or just the first one.
   * @returns A promise that resolves to an array of image urls.
   */
  generateStoryImages(params: {
    story: AiStory;
    createAllImages: boolean;
  }): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const {
        story: { contentImageDescription },
        createAllImages,
      } = params;
      let imagesQty = 0;
      if (createAllImages) {
        imagesQty = Math.ceil(contentImageDescription.length / 3);
        if (imagesQty > 3) imagesQty = 3;
        if (imagesQty < 1) imagesQty = 1;
      } else {
        imagesQty = 1;
      }
      this.logger.log(`Images quantity: ${imagesQty}`);
      // Sets the images quantity based on the content length

      // Splits the content into chunks 1-3 images
      const chunksLength = Math.ceil(
        contentImageDescription.length / imagesQty,
      );
      const contentChunks = chunk(contentImageDescription, chunksLength);
      const promises = contentChunks.map((chunk) => {
        const paragraph = `${chunk[0]}`;
        const prompt = `
        Aspect ratio: 9:16. 
        Setting: colorful decorations, fantasy environment.
        Lighting: Warm, soft lighting with glowing accents.
        Color Palette: Vibrant colors, pastels.
        Artistic Style: Whimsical storybook illustration, textured and detailed".
        The image should describe this scene: ${paragraph}
        the main character has this description: ${params.story.characterDescription}
        `;
        return this.openai.images
          .generate({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd',
            response_format: 'b64_json',
          })
          .then((response) => {
            return this.cloudStorageService.uploadImageToS3(
              response.data[0].b64_json || '',
            );
          })
          .catch((error) => {
            this.logger.error(error);
            return '';
          });
      });

      Promise.all(promises)
        .then((images) => {
          resolve(images);
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  // --------------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------------
  private childAgeConsiderations(childAge: number): string {
    if (childAge < 6)
      return 'The story should be focused on simple situations, friendly characters and teaching about simple values.';
    else if (childAge < 8)
      return 'The story should be an adventure with suspense and a clear message with a language suitable for a child aged 7-8 years.';
    else
      return 'Elaborate an adventure, challenges involving a bit of logic, and characters with more depth suitable for a child aged 8-10 years.';
  }
}
