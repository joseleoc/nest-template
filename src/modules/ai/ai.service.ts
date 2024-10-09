import OpenAI from 'openai';
import { Injectable } from '@nestjs/common';
import { zodResponseFormat } from 'openai/helpers/zod';
import { AiStory, AiStorySchema } from './schemas/ai-story.schema';
import { Story, StoryStyle } from '../stories/schemas/stories.schema';
import { faker } from '@faker-js/faker';
import { CreateStoryDto } from '../stories/dto/create-story.dto';
import { User } from '../users/schemas/user.schema';
import { PublicUser } from '../users/types/users.types';
// import { StoryStyle } from './schemas/stories.schemas';

@Injectable()
export class AiService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------

  private openai: OpenAI;
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor() {
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
  }): Promise<AiStory> {
    return new Promise((resolve: (value: AiStory) => void, reject) => {
      this.openai.chat.completions
        .create({
          model: 'gpt-4o-mini',
          response_format: zodResponseFormat(AiStorySchema, 'story'),
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant designed to output JSON. You will only output the JSON, and nothing else.',
            },
            {
              role: 'user',
              content:
                'Write an story about a boy named John. Provide a summary, a narrator, a character, a place, and a theme. The theme should be a concept or idea that the story explores, and the character should be a person or animal that the story is about. The place should be a location or setting that the story takes place in.',
            },
          ],
        })
        .then((completion) => {
          console.log(completion);
          let story: AiStory;
          if (typeof completion.choices[0].message.content === 'string') {
            story = JSON.parse(completion.choices[0].message.content);
          } else {
            story = completion.choices[0].message.content as any;
          }
          resolve(story);
        })
        .catch((error) => reject(error));

      const mockStory: Story = {
        title: faker.lorem.sentence(4),
        content: [
          faker.lorem.paragraph(),
          faker.lorem.paragraph(),
          faker.lorem.paragraph(),
        ],
        summary: faker.lorem.paragraph(),
        narratorId: '66fee460276fe7d5503d493f',
        style: StoryStyle.FICTIONAL,
        storyPurpose: faker.lorem.sentence(),
        coreIssue: faker.lorem.sentence(),
        characterId: '66fee460276fe7d5503d493f',
        placeId: '66fee460276fe7d5503d493f',
        images: [
          faker.image.urlPicsumPhotos(),
          faker.image.urlPicsumPhotos(),
          faker.image.urlPicsumPhotos(),
        ],
        thumbnail: faker.image.urlPicsumPhotos(),
        childId: '66fee460276fe7d5503d493f',
        userId: '66fee460276fe7d5503d493f',
        finalDetails: faker.lorem.paragraph(),
        readingTime: faker.number.int({ min: 0, max: 10 }),
      };
      resolve(mockStory);
    });
  }
}
