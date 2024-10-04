import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import OpenAI from 'openai';
import { Story } from './entities/story.entity';
import { faker } from '@faker-js/faker';
import { StoryStyle } from './schemas/stories.schemas';
import { UsersService } from '../users';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StoriesService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    @InjectModel(Story.name) private readonly storyModel: Model<Story>,
    private usersService: UsersService,
  ) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  async create(createStoryDto: CreateStoryDto): Promise<Story> {
    return new Promise(async (resolve: (value: any) => void, reject) => {
      // Check if the user has enough credits to create a story
      this.usersService
        .findUserAndCheckCredits(createStoryDto.userId)
        .then(({ canCreateStory, user }) => {
          // reject if the user is not found or deleted
          if (user == null) {
            reject({
              message: 'User not found',
              code: HttpStatus.NOT_FOUND,
            });
            return;
          }

          if (canCreateStory) {
            //Creates the story
            this.createStory(user)
              .then((story) => {
                // Updates the user credits
                const userCredits = user.credits - 1;
                this.usersService.updateCredits(user.id, userCredits);

                // Saves the story to the db
                this.saveStory(story)
                  .then(() => resolve(story))
                  .catch((error) => reject(error));
              })
              .catch((error) => reject(error));
          } else {
            // Reject if the user does not have enough credits
            reject({
              message: "User doesn't have enough credits to create a story",
              canCreate: canCreateStory,
              code: HttpStatus.PAYMENT_REQUIRED,
            });
          }
        });
    });

    // this.openai.chat.completions
    //   .create({
    //     model: 'gpt-4o-mini',
    //     messages: [
    //       { role: 'system', content: 'You are a helpful assistant.' },
    //       {
    //         role: 'user',
    //         content: 'Write a haiku about recursion in programming.',
    //       },
    //     ],
    //   })
    //   .then((completion) => {
    //     resolve(completion.choices[0].message);
    //   })
    //   .catch((error) => reject(error));
  }

  findAll() {
    return `This action returns all stories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} story`;
  }

  update(id: number, updateStoryDto: UpdateStoryDto) {
    return `This action updates a #${id} story`;
  }

  remove(id: number) {
    return `This action removes a #${id} story`;
  }

  // --------------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------------
  private createStory(params: any): Promise<Story> {
    return new Promise((resolve) => {
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

  private saveStory(story: Story): Promise<Story> {
    return new Promise((resolve, reject) => {
      this.storyModel
        .create(story)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }
}
