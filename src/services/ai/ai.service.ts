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
            2. **Place**: The story should take place in a setting with a given characteristics. Provide a detailed and vivid description of the place, including the atmosphere, surroundings, and key features that set the scene. In the content section, don't describe the setting's appearance, the only section that should be high detailed is the place section, in the place section describe the setting in detail suitable for an AI to generate an image the description should be 50 characters or less.
            3. **Story elements**: The story should revolve around:
            - A problem to be solved, which could be related to a given problem.
            - A lesson or teaching something, such as a given lesson.
            - The story should help with a given help.
             
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
              - **mainCharacter**: ${JSON.stringify(prompt.mainCharacter)} 
              - **storyPlace**: ${JSON.stringify(prompt.storyPlace)}
              - **solveProblem**: ${prompt.solveProblem ? `${prompt.solveProblem}` : 'a general childhood problem'}.
              - **teachSomething**: ${prompt.teachSomething ? `${prompt.teachSomething}` : 'a valuable life lesson'}.
              - **storyHelp**: ${prompt.storyHelp}
              - **finalDetails**: ${prompt.finalDetails}
              - **language**: ${prompt.language || user.language}
              - **paragraphLength**: ${prompt.paragraphsLength}
              `,
            },
          ],
          // messages: [
          //   {
          //     role: 'system',
          //     content:
          //       'You are a story assistant designed to output JSON. You will only output the JSON, and nothing else.',
          //   },
          //   {
          //     role: 'system',
          //     content: `
          //     You also are a ${prompt.storyNarrator.gender} ${prompt.storyNarrator.ageCategory} story narrator,
          //     and you will output the story in ${prompt.language || user.language} language.
          //     The story is narrated to a ${child?.gender || ''} child with ${child?.age || 9} years.
          //     The narrative should be clear, imaginative, and suitable for their comprehension level.
          //     `,
          //   },
          //   {
          //     role: 'user',
          //     content: `
          //     Please write a ${prompt.storyStyle} story for a child of ${child?.age || 9} years old. The story should include:

          //     1. **Main character**: The main character should have the following characteristics: ${prompt.mainCharacter.description}. Provide a **highly detailed description** of their personality, appearance, and motivations. Focus on their key traits and how they affect the story. In the content section, don't describe the character's appearance, but rather their actions, thoughts, and emotions, the only section that should be high detailed is the character section, in the character section describe the character appearance in detail suitable for an AI to generate an image the description should be 50 characters or less.

          //     2. **Place**: The story should take place in a setting with the following characteristics: ${prompt.storyPlace.description}. Provide a **detailed and vivid description** of the place, including the atmosphere, surroundings, and key features that set the scene. In the content section, don't describe the setting's appearance, but rather the actions, thoughts, and emotions that take place there, the only section that should be high detailed is the place section, in the place section describe the setting in detail suitable for an AI to generate an image the description should be 50 characters or less.

          //     3. **Story elements**: The story should revolve around:
          //     - A problem to be solved, which could be related to:
          //       ${prompt.solveProblem?.selectedOption ? `${prompt.solveProblem?.selectedOption}, concerning ${prompt.solveProblem?.inputValue}` : 'a general childhood problem'}.
          //     - A lesson or teaching moment, such as:
          //       ${prompt.teachSomething?.selectedOption ? `${prompt.teachSomething?.selectedOption}, related to ${prompt.teachSomething?.inputValue}` : 'a valuable life lesson'}.
          //     - The story should help with: ${prompt.storyHelp}.

          //     4. **Tone and style**: Ensure the tone of the story is age-appropriate and simple enough for a ${child?.age || 9} year-old child. The complexity should match their cognitive and emotional understanding, and the story should be enjoyable, imaginative, and fun.

          //     The story should be positive and educational, free from inappropriate content. Do not include:
          //     - Any offensive language, references to violence, drugs, or illegal activities.
          //     - Any sexual content, disturbing themes, or political discussions.
          //     - Any inappropriate references or unsuitable material for children.

          //     The narrative should be **suitable for a child**, using appropriate vocabulary and avoiding any complex or difficult-to-understand language.

          //     As a final consideration: ${prompt.finalDetails}. Ensure the story is safe, uplifting, and wholesome for young audiences.
          //     `,
          //   },
          // ],
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

  generateStoryImages(params: { story: AiStory }): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const {
        story: { contentImageDescription },
      } = params;

      // Sets the images quantity based on the content length
      let imagesQty = Math.ceil(contentImageDescription.length / 3);
      if (imagesQty > 3) imagesQty = 3;
      if (imagesQty < 1) imagesQty = 1;
      // Splits the content into chunks of 3 paragraphs
      const contentChunks = chunk(contentImageDescription, 3);
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
