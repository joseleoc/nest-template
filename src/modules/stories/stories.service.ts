import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import OpenAI from 'openai';
import { Story } from './entities/story.entity';
import { faker } from '@faker-js/faker';
import { StoryStyle } from './schemas/stories.schemas';
import { UsersService } from '../users';

@Injectable()
export class StoriesService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(private usersService: UsersService) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  async create(createStoryDto: CreateStoryDto): Promise<Story> {
    return new Promise(async (resolve: (value: any) => void, reject) => {
      this.usersService
        .findOneById(createStoryDto.userId)
        .then(async (user) => {
          if (user == null) {
            reject({
              message: 'User not found',
              code: HttpStatus.NOT_FOUND,
            });
            return;
          }
          this.usersService.canCreateStory(user).then((canCreateStory) => {
            if (canCreateStory) {
              const mockStory: Story = {
                title: faker.lorem.sentence(4),
                content: faker.lorem.paragraph(),
                summary: faker.lorem.paragraph(),
                narratorId: faker.string.uuid(),
                style: StoryStyle.FICTIONAL,
                storyPurpose: faker.lorem.sentence(),
                coreIssue: faker.lorem.sentence(),
                characterId: faker.string.uuid(),
                placeId: faker.string.uuid(),
                images: [faker.image.urlPicsumPhotos()],
                thumbnail: faker.image.urlPicsumPhotos(),
                childId: faker.string.uuid(),
                userId: faker.string.uuid(),
                finalDetails: faker.lorem.paragraph(),
                readingTime: faker.number.int({ min: 0, max: 10 }),
              };

              const userCredits = user.credits - 1;
              this.usersService.updateCredits(user.id, userCredits);
              resolve(mockStory);
            } else {
              reject({
                message: "User doesn't have enough credits to create a story",
                canCreate: canCreateStory,
                code: HttpStatus.PAYMENT_REQUIRED,
              });
            }
          });
        })
        .catch((error) => reject(error));
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
}
