//TODO: Remove this line
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { UsersService } from '../users';
import { AiService } from '@/services/ai/ai.service';
import { AiStory } from '@/services/ai/schemas/ai-story.schema';
import { ChildrenService } from '@/modules/children/children.service';
import { NarratorsService } from '@/modules/narrators/narrators.service';
import { TextToSpeechService } from '@/services/text-to-speech/text-to-speech.service';

import { Story } from './schemas/stories.schema';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryContent } from './schemas/stories-content.schema';
import { CloudStorageService } from '../../services/cloud-storage/cloud-storage.service';
import { PublicStory } from './stories.types';

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
    private cloudStorageService: CloudStorageService,
  ) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  create(createStoryDto: CreateStoryDto): Promise<Story> {
    return new Promise((resolve: (value: any) => void, reject) => {
      const {
        userId,
        childId,
        storyNarrator,
        mainCharacter,
        solveProblem,
        teachSomething,
        storyHelp,
        storyStyle,
        storyPlace,
        finalDetails,
      } = createStoryDto;
      // Check if the user has enough credits to create a story and search for the child if it exists.
      Promise.all([
        this.usersService.findUserAndCheckCredits(userId),
        this.childrenService.findChildById(childId),
        this.narratorService.findOneByGenderAndAge({
          gender: storyNarrator.gender,
          ageCategory: storyNarrator.ageCategory,
        }),
      ])
        .then((res) => {
          const [{ canCreateStory, user }, child, narrator] = res;
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
          if (narrator == null) {
            return reject({
              message: 'Narrator not found',
              code: HttpStatus.NOT_FOUND,
            });
          } //Creates the story
          this.aiService
            .createStory({ user, prompt: createStoryDto, child })
            .then((story: AiStory) => {
              const userCredits = user.credits - 1;
              // Returns the story and the audio streams and  updates the user credits.
              return Promise.all([
                story,
                this.textToSpeechService.createAudioStreamFromText({
                  paragraphs: story.content,
                  narrator,
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
                mainCharacter: mainCharacter,
                storyStyle: storyStyle,
                solveProblem: solveProblem,
                teachSomething: teachSomething,
                storyHelp: storyHelp,
                narratorId: narrator.id,
                storyPlace: storyPlace,
                userId: user.id,
                childId: child?._id,
                finalDetails: finalDetails,
                readingTime: audio.duration || 0,
              };
              try {
                return this.storyModel.create(newStory);
              } catch (error) {
                this.logger.error(error);
                reject(error);
              }
            })
            .then((story) => {
              const newStory = new PublicStory(story);
              return newStory.generateAudiosUrls(this.cloudStorageService);
            })
            .then((story) => resolve(story))
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
