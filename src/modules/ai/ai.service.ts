import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { faker } from '@faker-js/faker';
// import { StoryStyle } from './schemas/stories.schemas';

@Injectable()
export class AiService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------

  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    project: process.env.OPENAI_PROJECT,
    organization: process.env.OPENAI_ORGANIZATION,
  });
  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  createStory(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.openai.chat.completions
        .create({
          model: 'gpt-4o-mini',
          metadata: { type: 'story' },
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'story',

              description:
                'Story for kids, with a minimum of 4 paragraphs, and a maximum of 6 paragraphs. The story should be written in the third person, and should include a summary, a narrator, a character, a place, and a theme. The theme should be a concept or idea that the story explores, and the character should be a person or animal that the story is about. The place should be a location or setting that the story takes place in.',
              schema: {
                type: 'object',
                properties: {
                  paragraphs: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  placeDescription: { type: 'string' },
                  summary: { type: 'string' },
                },
                required: ['paragraphs', 'placeDescription', 'summary'],
                additionalProperties: false,
              },
              strict: true,
            },
          },
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant designed to output JSON.',
            },
            {
              role: 'user',
              content: 'Write a haiku about recursion in programming.',
            },
          ],
        })
        .then((completion) => {
          resolve(completion.choices[0].message);
        })
        .catch((error) => reject(error));

      // const mockStory: Story = {
      //   title: faker.lorem.sentence(4),
      //   content: [
      //     faker.lorem.paragraph(),
      //     faker.lorem.paragraph(),
      //     faker.lorem.paragraph(),
      //   ],
      //   summary: faker.lorem.paragraph(),
      //   narratorId: '66fee460276fe7d5503d493f',
      //   style: StoryStyle.FICTIONAL,
      //   storyPurpose: faker.lorem.sentence(),
      //   coreIssue: faker.lorem.sentence(),
      //   characterId: '66fee460276fe7d5503d493f',
      //   placeId: '66fee460276fe7d5503d493f',
      //   images: [
      //     faker.image.urlPicsumPhotos(),
      //     faker.image.urlPicsumPhotos(),
      //     faker.image.urlPicsumPhotos(),
      //   ],
      //   thumbnail: faker.image.urlPicsumPhotos(),
      //   childId: '66fee460276fe7d5503d493f',
      //   userId: '66fee460276fe7d5503d493f',
      //   finalDetails: faker.lorem.paragraph(),
      //   readingTime: faker.number.int({ min: 0, max: 10 }),
      // };
      // resolve(mockStory);
    });
  }
}
