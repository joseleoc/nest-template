//TODO: Remove this line
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import { UsersService } from '../users';
import { AiService } from '@/services/ai/ai.service';
import { AiStory } from '@/services/ai/schemas/ai-story.schema';
import { ChildrenService } from '@/modules/children/children.service';
import { NarratorsService } from '@/modules/narrators/narrators.service';
import { TextToSpeechService } from '@/services/text-to-speech/text-to-speech.service';

import { Story } from './schemas/stories.schema';
import { CreateStoryDto } from './dto/create-story.dto';
import { StoryContent } from './schemas/stories-content.schema';
import { CloudStorageService } from '@/services/cloud-storage/cloud-storage.service';
import { PublicStory, StoryCounterParams } from './stories.types';
import { StoriesLikes } from './schemas/stories-likes.schema';
import { StoriesViews } from './schemas/stories-views.schema';
import { StoriesShare } from './schemas/stories-share.schema';
import { GetAllStoriesDto } from './dto/get-all-stories.dto';
import { ReportStoryDto } from './dto/report-story.dto';
import { User } from '../users/schemas/user.schema';
import { StoriesReports } from './schemas/stories-reports.schema';

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
    @InjectModel(StoriesLikes.name)
    private readonly storiesLikesModel: Model<StoriesLikes>,
    @InjectModel(StoriesViews.name)
    private readonly storiesViewsModel: Model<StoriesViews>,
    @InjectModel(StoriesShare.name)
    private readonly storiesShareModel: Model<StoriesShare>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(StoriesReports.name)
    private readonly storiesReportModel: Model<StoriesReports>,
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
  /**
   * Creates a story.
   * @param createStoryDto - The story data to create.
   * @returns A promise that resolves to the created story.
   */
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
                this.textToSpeechService.createAudioFromText({
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
              if (!story) {
                throw new Error('Story creation failed, story is undefined.');
              }
              const newStory = new PublicStory(story);
              newStory.liked = false;
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

  getAllStories(params: GetAllStoriesDto): Promise<PublicStory[]> {
    return new Promise((resolve, reject) => {
      let { page, limit } = params;
      limit = limit <= 0 ? 10 : limit;
      limit = limit > 50 ? 50 : limit;
      page = page <= 0 ? 0 : page;
      this.storyModel
        .find()
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .then((stories) => {
          console.log('storiesLength', stories.length);
          const publicStories = stories.map((story) => new PublicStory(story));
          return this.generateStoriesMetaParams(publicStories);
        })
        .then((publicStories) => {
          resolve(publicStories);
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  /**
   * Finds all stories created by a user.
   * @param id - The id of the user to find the stories of.
   * @returns A promise that resolves to an array of stories.
   */
  findUserStories(id: string): Promise<PublicStory[]> {
    return new Promise((resolve, reject) => {
      this.storyModel
        .find({ userId: id })
        .sort({ createdAt: -1 })
        .then((stories) => {
          const publicStories = stories.map((story) => new PublicStory(story));

          return this.generateStoriesMetaParams(publicStories);
        })
        .then((publicStories) => {
          resolve(publicStories);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Toggles the like of a story.
   * @param params - The storyId and userId of the story to toggle the like of.
   * @returns A promise that resolves to an object with the likesCount of the story.
   */
  toggleLike(
    params: StoryCounterParams,
  ): Promise<{ likesCount: number } | null> {
    return new Promise((resolve, reject) => {
      const { storyId, userId } = params;

      // Find if the user already liked the story
      this.storiesLikesModel
        .findOne({ userId, storyId })
        .then((like) => {
          //  Operations to perform:
          // 1. Updates the likesCount of the story, subtracting or adding 1 based on the user's like.
          const updateOperation = like
            ? { $inc: { likesCount: -1 } }
            : { $inc: { likesCount: 1 } };
          // 2. Deletes the like if the user already liked the story. Otherwise resolves undefined.
          const deleteOperation = like
            ? this.storiesLikesModel.deleteOne({ userId, storyId })
            : Promise.resolve();
          // 3. Creates a new like if the user did not like the story. Otherwise resolves undefined.
          const createOperation = !like
            ? this.storiesLikesModel.create({ userId, storyId })
            : Promise.resolve();

          Promise.all([
            this.storyModel.updateOne({ _id: storyId }, updateOperation),
            deleteOperation,
            createOperation,
          ])
            .then(([updateRes, deleteRes, createRes]) => {
              if (updateRes.modifiedCount === 0) {
                reject(null);
                return null;
              }
              return this.storyModel.findById(storyId);
            })
            .then((story) => {
              if (story != null && story.deleted === false) {
                resolve({ likesCount: story.likesCount || 0 });
              } else {
                reject(null);
              }
            })
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

  /**
   * Counts the view of a story. Always increments the viewsCount by 1 every time it is called.
   * @param params - The storyId and userId of the story to count the view of.
   * @returns A promise that resolves to an object with the viewsCount of the story.
   */
  countView(
    params: StoryCounterParams,
  ): Promise<{ viewsCount: number } | null> {
    return new Promise((resolve, reject) => {
      const { storyId, userId } = params;
      Promise.all([
        this.storiesViewsModel.findOne({ userId, storyId }),
        this.storyModel.updateOne(
          { _id: storyId },
          { $inc: { viewsCount: 1 } },
        ),
      ])
        .then(([view, updateRes]) => {
          if (updateRes.modifiedCount === 0) {
            reject(null);
            return null;
          }

          if (view === null) {
            this.storiesViewsModel.create({ userId, storyId });
          }

          this.storyModel.findById(storyId).then((story) => {
            if (story != null && story.deleted === false) {
              resolve({ viewsCount: story.viewsCount || 0 });
            } else {
              reject(null);
            }
          });
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  /**
   * Counts the share of a story. Always increments the sharesCount by 1 every time it is called.
   * @param params - The storyId and userId of the story to count the share of.
   * @returns A promise that resolves to an object with the sharesCount of the story.
   */
  countShare(
    params: StoryCounterParams,
  ): Promise<{ sharesCount: number } | null> {
    return new Promise((resolve, reject) => {
      const { storyId, userId } = params;
      Promise.all([
        this.storiesShareModel.findOne({ userId, storyId }),
        this.storyModel.updateOne(
          { _id: storyId },
          { $inc: { sharesCount: 1 } },
        ),
      ])
        .then(([view, updateRes]) => {
          if (updateRes.modifiedCount === 0) {
            reject(null);
            return null;
          }

          if (view === null) {
            this.storiesShareModel.create({ userId, storyId });
          }

          this.storyModel.findById(storyId).then((story) => {
            if (story != null && story.deleted === false) {
              resolve({ sharesCount: story.sharesCount || 0 });
            } else {
              reject(null);
            }
          });
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  report(params: ReportStoryDto): Promise<{ reportId: string } | null> {
    return new Promise((resolve, reject) => {
      const { storyId, userId, reason } = params;
      Promise.all([
        this.storyModel.findById(storyId),
        this.userModel.findById(userId),
      ])
        .then(([story, user]) => {
          if (story == null || user == null) {
            resolve(null);
            return;
          }
          console.log({ storyId: story.id, userId: user.id, reason });
          return this.storiesReportModel.create({
            storyId: story.id,
            userId: user.id,
            reason,
          });
        })
        .then((report) => {
          if (report == null) {
            resolve(null);
            return;
          }
          resolve({ reportId: report.id });
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
      // this.storiesReportModel
      //   .create(params)
      //   .then(() => {
      //     resolve();
      //   })
      //   .catch((error) => {
      //     this.logger.error(error);
      //     reject(error);
      //   });
    });
  }

  //--------------------------------------------------------------------------------
  // Private methods
  //--------------------------------------------------------------------------------
  /**
   * Checks if the user has liked a story.
   * @param params - The storyId and userId of the story to check.
   * @returns A promise that resolves to an object with the storyId and liked property set to true if the user has liked the story, or false otherwise.
   */
  private checkUserStoryLike(params: {
    userId: string;
    storyId: string;
  }): Promise<{ storyId: string; liked: boolean } | null> {
    return new Promise((resolve, reject) => {
      const { userId, storyId } = params;
      this.storiesLikesModel
        .findOne({ userId, storyId })
        .then((like) => {
          if (like != null) {
            resolve({ storyId: storyId, liked: true });
          } else {
            resolve({ storyId: storyId, liked: false });
          }
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  private generateStoriesMetaParams(
    stories: PublicStory[],
  ): Promise<PublicStory[]> {
    return new Promise((resolve, reject) => {
      // Check if the user has liked the story
      const likesPromises = stories.map((story) =>
        this.checkUserStoryLike({ userId: story.userId, storyId: story.id }),
      );

      // Generates the audios urls
      const audiosURLsPromises = stories.map((story) =>
        story.generateAudiosUrls(this.cloudStorageService),
      );

      // Combines the promises
      Promise.all([Promise.all(likesPromises), Promise.all(audiosURLsPromises)])
        .then(([likes, storiesWithAudiosURLs]) => {
          // Adds the liked property to the stories
          const storiesWithLikes = storiesWithAudiosURLs.map((story) => {
            let liked = false;
            if (likes) {
              const like = likes.find((like) => like?.storyId === story.id);
              liked = like?.liked ?? false;
            }
            story.liked = liked;
            return story;
          });
          resolve(storiesWithLikes);
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }
}
