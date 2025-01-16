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
import appConfig from '@/config/app.config';
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
      apiKey: appConfig().OPENAI.OPENAI_API_KEY,
      project: appConfig().OPENAI.OPENAI_PROJECT,
      organization: appConfig().OPENAI.OPENAI_ORGANIZATION,
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
                  Generate an engaging, entertaining, and educational story in ${prompt.language}.  

                  ${
                    prompt.finalDetails &&
                    `
                    ### **Key Priority**:  
                    - The story must be primarily shaped by the following user-provided details:  
                      "${prompt.finalDetails}".  
                    - Ensure that every aspect of the **finalDetails** is meaningfully incorporated and strongly influences the plot, characters, and setting.`
                  }

                  ### Age-Specific Considerations:  
                  - The story should be tailored to a child aged **${child?.age || 9}** years. Use the following guidelines for story content and language:  
                    - **Below 6 years old**:  
                      - **Content**: Focus on simple situations, friendly characters, and teaching basic values like kindness, sharing, and honesty.  
                      - **Language**: Use short, simple sentences with familiar and repetitive words. Avoid complex vocabulary or abstract concepts.  
                    - **6-7 years old**:  
                      - **Content**: Introduce adventurous elements with mild suspense and a clear, uplifting message. Scenarios should remain relatable to the child's experiences.  
                      - **Language**: Use slightly longer sentences with an engaging yet simple vocabulary. Include dialogue and actions that spark curiosity but avoid overly complex ideas.  
                    - **8-10 years old**:  
                      - **Content**: Develop an elaborate adventure with challenges that involve logic or problem-solving. Characters should have depth and relatable emotions.  
                      - **Language**: Use more descriptive language with occasional advanced vocabulary. Allow for more complex sentences and ideas that encourage critical thinking and engagement.
                    - **Above 10 years old**:  
                      - **Content**: Introduce intricate plots with layered challenges, moral dilemmas, and nuanced characters. Themes can involve broader topics such as teamwork, resilience, or discovery.  
                      - **Language**: Use sophisticated vocabulary and sentence structures. Incorporate vivid descriptions, dialogue with subtext, and moments that challenge the reader's imagination or perspective.

                  ### Story Structure:  
                  - The story must be long enough to last **at least 2 minutes** when read aloud.  
                  - Include these narrative elements:  
                    - A **clear beginning** to set up the plot and characters.  
                    - A **rising action** that builds tension.  
                    - A **climax** where the conflict reaches its peak.  
                    - A **falling action** leading to resolution.  
                    - A **satisfying conclusion**.  

                  ### Length and Style:  
                  - Write at least ${prompt.paragraphsLength} paragraphs to fully develop the story, its plot, and characters. Expand as needed for depth.  
                  - The tone should be free from violence or inappropriate themes.  

                  ### Creative Specifications:  
                  - The story's style should match ${prompt.storyStyle}.  
                  - If additional details are provided (${!!prompt.finalDetails}), integrate them meaningfully: "${prompt.finalDetails}".  

                  ### Character Details:  
                  - The main character is ${prompt.mainCharacter},${prompt.mainCharacterDescription ?? `, described as ${prompt.mainCharacterDescription}`}.  
                    - In the **content** field:  
                      - Avoid detailed physical descriptions of the main character. Focus on their actions, personality, or role in the story.  
                    - In the **characterDescription** field:  
                      - Provide a detailed description of the main character's appearance, intended for creating a visual representation using tools like DALL-E.  
                      - Include attributes such as:  
                        - Skin color, eye color, and clothing details.  
                        - Age, height, weight, and unique identifiers (e.g., hairstyle, accessories).  

                  ### Setting Details:  
                  - The story takes place in ${prompt.scenario}, ${prompt.scenarioDescription ?? `described as: ${prompt.scenarioDescription}`}.  
                    - In the **placeDescription** field, provide vivid details about the setting, including atmosphere, surroundings, and key features (50-200 characters).  
                  - Avoid over-describing the setting in the **content** field; only use high-level details there.  

                  ### Focus and Purpose:  
                  - The story should center around ${prompt.focus}${prompt.focusDescription ?? `, with the specific focus: ${prompt.focusDescription}`}.  
                  - It should explore themes related to ${prompt.core}.
                  - If applicable (${prompt.purpose != GeneralPurpose.OTHER}), emphasize ${prompt.purpose}.  

                  ### Summary:  
                  - Provide a summary that is **engaging** and appeals to both young and adult readers, no longer than 50 words.
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
    createStoryParams: CreateStoryDto;
    createAllImages: boolean;
  }): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const {
        story: { contentImageDescription },
        createAllImages,
        createStoryParams: { paragraphsLength },
      } = params;
      let imagesQty = 0;
      if (createAllImages) {
        switch (true) {
          case paragraphsLength <= 5:
            // If the story has less than 5 paragraphs, it should have 1 image
            imagesQty = 2;
            break;

          case paragraphsLength > 5 && paragraphsLength <= 10:
            // If the story has between 5 and 10 paragraphs, it should have 3 images
            imagesQty = 3;
            break;

          case paragraphsLength > 10 && paragraphsLength <= 15:
            // if the story has between 10 and 15 paragraphs, it should have 5 images
            imagesQty = 5;
            break;

          case paragraphsLength > 15 && paragraphsLength <= 20:
            // If the story has between 15 and 20 paragraphs, it should have 7 images
            imagesQty = 7;
            break;

          case paragraphsLength > 20:
            // If the story has more than 20 paragraphs, it should have 7 images
            imagesQty = 7;
            break;

          default:
            imagesQty = 1;
            break;
        }
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
}
