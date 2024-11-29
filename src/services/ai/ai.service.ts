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
import {
  Focus,
  GeneralPurpose,
  MainCharacter,
  StoryScenario,
} from '@/modules/stories/types/stories.types';
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
          model: 'gpt-4o-mini',
          response_format: zodResponseFormat(AiStorySchema, 'story'),
          messages: [
            {
              role: 'system',
              content:
                'You are a story assistant designed to output JSON. You will only output the JSON, and nothing else. provide the following fields in a JSON dict, where applicable: {"type":"object","properties":{"title":{"type":"string"},"summary":{"type":"string"},"content":{"type":"array","items":{"type":"string"}},"contentImageDescription":{"type":"array","items":{"type":"string"}},"placeDescription":{"type":"string"},"character":{"type":"string"},"place":{"type":"string"}},"required":["title","summary","content","contentImageDescription","placeDescription","character","place"],"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"}',
            },
            {
              role: 'system',
              content:
                'You are an expert in creating creative stories for children aged 5-10, and you will output the story in a given language.',
            },
            {
              role: 'system',
              content: `Please write a story with a given style for a child of a given age. The story should be at least a given length of paragraphs long. Each paragraph should be between 20 words and 65 words. The story should include:
            1. **Main character**: The main character should have a given characteristics. Provide a detailed description of the character's appearance, in the content section, don't describe the character's appearance, but rather their actions, thoughts, and emotions, the only section that should be high detailed is the character section, in the character section describe the character appearance in detail suitable for an AI to generate an image the description should be 50 characters or less.
            2. **Scenario**: The story should take place in a setting with a given characteristics. Provide a detailed and vivid description of the place, including the atmosphere, surroundings, and key features that set the scene. In the content section, don't describe the setting's appearance, the only section that should be high detailed is the place section, in the place section describe the setting in detail suitable for an AI to generate an image the description should be 50 characters or less.
            3. **Story elements**: The story should revolve around:
            - I will provide the core of the story that will be the main idea of the story. The core should be related to a given problem.
            - I will provide the purpose of the story that will be the main idea of the story. The purpose should be related to solve the given problem.
            - I will provide the story focus that will be the main idea of the story. The focus is the main idea of the story that the story should be round about.
             
            4. **Tone and style**: ${this.childAgeConsiderations(child?.age || 7)} and the story should be enjoyable, imaginative, and fun.
                The story should be positive and educational, free from inappropriate content. Do not include:
                - Any offensive language, references to violence, drugs, or illegal activities.
                - Any sexual content, disturbing themes, or political discussions.
                - Any inappropriate references or unsuitable material for children.
            
            5. **ContentImageDescription**: Provide an array of prompts, one for each content paragraph, to use in a AI image generation model describing each of the contents in a format suitable for a prompt. The prompt should include a similar disney style of a child's story, vibrant colors and should be in hight definition and realistic; describe the main character using the main character's description with high detail; describe the scene using the place's description with high detail. Each prompt in the array should describe in high details the character, scene and style. The prompt should be in english. The promt must specify that each character must be the same, without being modified in each scene, each prompt should not exceed the 700 characters limit.

            6. **Final details**: Ensure the story is safe, uplifting, and wholesome for young audiences. Take in great consideration the given final details.`,
            },
            {
              role: 'user',
              content: `
              - **storyStyle**: ${prompt.storyStyle}
              - **childAge**: ${child?.age || 9} 
              - **mainCharacter**: ${prompt.mainCharacter != MainCharacter.OTHER ? prompt.mainCharacter : ''} ${prompt.mainCharacterDescription != '' ? prompt.mainCharacterDescription : ''}
              - **scenario**: ${prompt.scenario != StoryScenario.OTHER ? prompt.scenario : ''} ${prompt.scenarioDescription != '' ? prompt.scenarioDescription : ''}
              - **storyCore**: ${prompt.core}
              - **storyPurpose**: ${prompt.purpose != GeneralPurpose.OTHER ? prompt.purpose : ''} ${prompt.purposeDescription != '' ? prompt.purposeDescription : ''}
              - **storyFOcus**: ${prompt.focus != null && prompt.focus != Focus.OTHER ? prompt.focus : ''} ${prompt.focusDescription != '' ? prompt.focusDescription : ''}
              - **finalDetails**: ${prompt.finalDetails}
              - **language**: ${prompt.language || user.language}
              - **paragraphLength**: ${prompt.paragraphsLength}
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
      const chunksLength = contentImageDescription.length / imagesQty;
      const contentChunks = chunk(contentImageDescription, chunksLength);
      const promises = contentChunks.map((chunk) => {
        const paragraph = chunk[0];
        const prompt = `Aspect ratio: 9:16. Setting: Magical school with colorful decorations, fantasy environment. Lighting: Warm, soft lighting with glowing accents. Color Palette: Vibrant colors, pastels. Artistic Style: Whimsical storybook illustration, textured and detailed". ${paragraph}`;

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
