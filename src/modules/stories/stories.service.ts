//TODO: Remove this line
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { UsersService } from '../users';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiService } from '../../services/ai/ai.service';
import { AiStory } from '../../services/ai/schemas/ai-story.schema';
import { Story } from './schemas/stories.schema';
import { ChildrenService } from '../children/children.service';
import { TextToSpeechService } from '../../services/text-to-speech/text-to-speech.service';
import { StoryContent } from './schemas/stories-content.schema';
import { NarratorsService } from '../narrators/narrators.service';

@Injectable()
export class StoriesService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger(StoriesService.name);
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    @InjectModel(Story.name) private readonly storyModel: Model<Story>,
    private usersService: UsersService,
    private aiService: AiService,
    private childrenService: ChildrenService,
    private textToSpeechService: TextToSpeechService,
    private narratorService: NarratorsService,
  ) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  create(createStoryDto: CreateStoryDto): Promise<Story> {
    return new Promise((resolve: (value: any) => void, reject) => {
      // Check if the user has enough credits to create a story and search for the child if it exists.
      Promise.all([
        this.usersService.findUserAndCheckCredits(createStoryDto.userId),
        this.childrenService.findChildById(createStoryDto.childId),
      ])
        .then((res) => {
          const [{ canCreateStory, user }, child] = res;
          if (user == null) {
            // Reject if the user is not found or deleted
            return reject({
              message: 'User not found',
              code: HttpStatus.NOT_FOUND,
            });
          }
          if (canCreateStory === false) {
            // Reject if the user does not have enough credits
            return reject({
              message: "User doesn't have enough credits to create a story",
              canCreate: canCreateStory,
              code: HttpStatus.PAYMENT_REQUIRED,
            });
          }
          //Creates the story
          this.aiService
            .createStory({ user, prompt: createStoryDto, child })
            .then((story: AiStory) => {
              const userCredits = user.credits - 1;
              // Returns the story and the audio streams and  updates the user credits.
              return Promise.all([
                story,
                this.textToSpeechService.createAudioStreamFromText({
                  paragraphs: story.content,
                }),
                this.usersService.updateCredits(user.id, userCredits),
              ]);
            })
            .then((res) => {
              const [story, audio] = res;
              // Creates an array of StoryContent objects with the audio streams and images.
              const content: StoryContent[] = new Array(story.content.length);
              for (let i = 0; i < story.content.length; i++) {
                content[i] = {
                  paragraph: story.content[i],
                  audio: audio.fileNames[i],
                  image: '',
                };
              }
              const newStory: Story = {
                title: story.title,
                content,
                summary: story.summary,
                mainCharacter: createStoryDto.mainCharacter,
                storyStyle: createStoryDto.storyStyle,
                solveProblem: createStoryDto.solveProblem,
                teachSomething: createStoryDto.teachSomething,
                storyHelp: createStoryDto.storyHelp,
                storyNarrator: createStoryDto.storyNarrator,
                storyPlace: createStoryDto.storyPlace,
                userId: user.id,
                childId: child?._id,
                finalDetails: createStoryDto.finalDetails,
                readingTime: audio.duration || 0,
              };
              return this.storyModel.create(newStory);
            })
            .then((story) => resolve(story.toJSON()))
            .catch((error) => {
              this.logger.error(error);
              reject(error);
            });
        })
        .catch((error) => {
          this.logger.error(error);
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
}
