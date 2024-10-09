import OpenAI from 'openai';
import { Injectable } from '@nestjs/common';
import { zodResponseFormat } from 'openai/helpers/zod';
import { AiStory, AiStorySchema } from './schemas/ai-story.schema';
import { CreateStoryDto } from '../stories/dto/create-story.dto';
import { User } from '../users/schemas/user.schema';
import { PublicUser } from '../users/types/users.types';
import { PublicChild } from '../children/types/children.types';

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
    child?: PublicChild | null;
  }): Promise<AiStory> {
    return new Promise((resolve: (value: AiStory) => void, reject) => {
      const { prompt, user, child } = params;
      this.openai.chat.completions
        .create({
          model: 'gpt-4o-mini',
          response_format: zodResponseFormat(AiStorySchema, 'story'),
          messages: [
            {
              role: 'system',
              content:
                'You are a story assistant designed to output JSON. You will only output the JSON, and nothing else.',
            },
            {
              role: 'system',
              content: `You also are a ${prompt.storyNarrator.gender} ${prompt.storyNarrator.ageCategory} story narrator, and you will output the story in ${prompt.language || user.language} language. The story is narrated to a ${child?.gender || ''} child with ${child?.age || 9} years.`,
            },
            {
              role: 'user',
              content: `Please,
              create a ${prompt.storyStyle} story for a child with ${child?.age || 9} years.
              The story must take place in: ${prompt.storyPlace.description}.
              The main character is: ${prompt.mainCharacter.description}.
              The story should revolve around solving the following problem: ${prompt.solveProblem.selectedOption}, related to ${prompt.solveProblem.inputValue}.
              The story should teach or help with: ${prompt.storyHelp}.

              As a final considerations: ${prompt.finalDetails}.

              The story must be written in ${prompt.language || user.language} language.
              takes place in ${prompt.storyPlace.description}`,
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
        })
        .catch((error) => {
          reject(error);
        });

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
