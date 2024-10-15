//TODO: Remove this line
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { UsersService } from '../users';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiService } from '../../services/ai/ai.service';
import { AiStory } from '../../services/ai/schemas/ai-story.schema';
import { PublicUser } from '../users/types/users.types';
import { Story } from './schemas/stories.schema';
import { ChildrenService } from '../children/children.service';
import { PublicChild } from '../children/types/children.types';

@Injectable()
export class StoriesService {
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    @InjectModel(Story.name) private readonly storyModel: Model<Story>,
    private usersService: UsersService,
    private aiService: AiService,
    private ChildrenService: ChildrenService,
  ) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  async create(createStoryDto: CreateStoryDto): Promise<Story> {
    return new Promise(async (resolve: (value: any) => void, reject) => {
      // Check if the user has enough credits to create a story
      Promise.all([
        this.usersService.findUserAndCheckCredits(createStoryDto.userId),
        this.ChildrenService.findChildById(createStoryDto.childId),
      ])
        .then((res) => {
          const [{ canCreateStory, user }, child] = res;
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
            this.aiService
              .createStory({ user, prompt: createStoryDto, child })
              .then((story) => {
                // Updates the user credits
                const userCredits = user.credits - 1;
                this.usersService.updateCredits(user.id, userCredits);
                // Saves the story to the db
                this.saveStory({ story, user, child, prompt: createStoryDto })
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
        })

        .catch((error) => {
          reject(error);
        });
    });
  }

  findUserStories(id: string): Promise<Story[]> {
    return new Promise((resolve, reject) => {
      this.storyModel
        .find({ userId: id })
        .sort({ createdAt: -1 })
        .then((stories) => {
          resolve(stories);
        })
        .catch((error) => {
          reject(error);
        });
    });
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

  private saveStory(params: {
    story: AiStory;
    user: PublicUser;
    child: PublicChild | null;
    prompt: CreateStoryDto;
  }): Promise<Story> {
    return new Promise((resolve, reject) => {
      const { story, user, child, prompt } = params;
      const newStory: Story = {
        title: story.title,
        content: story.content,
        summary: story.summary,
        mainCharacter: prompt.mainCharacter,
        storyStyle: prompt.storyStyle,
        solveProblem: prompt.solveProblem,
        teachSomething: prompt.teachSomething,
        storyHelp: prompt.storyHelp,
        storyNarrator: prompt.storyNarrator,
        storyPlace: prompt.storyPlace,
        images: [],
        userId: user.id,
        childId: child?._id,
        finalDetails: prompt.finalDetails,
      };
      this.storyModel
        .create(newStory)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
