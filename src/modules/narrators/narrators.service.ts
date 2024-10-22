/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Narrator, NarratorAgeCategory } from './schemas/narrators.schema';
import { Model } from 'mongoose';
import { Gender } from '@/general.types';
import { PublicNarrator } from './schemas/types/narrators.types';

@Injectable()
export class NarratorsService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger(NarratorsService.name);
  private readonly defaultNarrators: Omit<PublicNarrator, 'id'>[] = [
    {
      name: 'Benjamin - Deep, Warm, Calming',
      voiceId: 'LruHrtVF6PSyGItzMNHS',
      gender: Gender.MALE,
      ageCategory: NarratorAgeCategory.EDERLY,
    },
    {
      name: 'Brian Overturf',
      voiceId: 'ryn3WBvkCsp4dPZksMIf',
      gender: Gender.MALE,
      ageCategory: NarratorAgeCategory.ADULT,
    },
    {
      name: 'Tyler Kurk',
      voiceId: 'raMcNf2S8wCmuaBcyI6E',
      gender: Gender.MALE,
      ageCategory: NarratorAgeCategory.YOUNG,
    },
    {
      name: 'Brittney - Male Child - Youthful, Raspy, Cute & Excitable',
      voiceId: '5HuFhTDIKwL0cGenPHbW',
      gender: Gender.MALE,
      ageCategory: NarratorAgeCategory.CHILD,
    },
    {
      name: 'Nora',
      voiceId: '0YCdTbygrMV0VFUAAziF',
      gender: Gender.FEMALE,
      ageCategory: NarratorAgeCategory.EDERLY,
    },
    {
      name: 'Alicia Speaks-Unique and Pleasant',
      voiceId: 'OOk3INdXVLRmSaQoAX9D',
      gender: Gender.FEMALE,
      ageCategory: NarratorAgeCategory.ADULT,
    },
    {
      name: 'Hope - upbeat and clear',
      voiceId: 'tnSpp4vdxKPjI9w0GnoV',
      gender: Gender.FEMALE,
      ageCategory: NarratorAgeCategory.YOUNG,
    },
    {
      name: 'Kade Murdock - Childish voice',
      voiceId: '0m2tDjDewtOfXrhxqgrJ',
      gender: Gender.FEMALE,
      ageCategory: NarratorAgeCategory.CHILD,
    },
  ];
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    @InjectModel(Narrator.name) private readonly narratorModel: Model<Narrator>,
  ) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------

  findAll(): Promise<PublicNarrator[]> {
    return new Promise((resolve, reject) => {
      this.narratorModel
        .find()
        .then((data) => {
          const narrators = data.map(
            (narrator) => new PublicNarrator(narrator),
          );
          resolve(narrators);
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  findOneById(id: string) {
    return new Promise((resolve, reject) => {
      this.narratorModel
        .findById(id)
        .then((narrator) => {
          if (narrator != null) {
            resolve(new PublicNarrator(narrator));
          } else {
            reject(null);
          }
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }

  findOneByGenderAndAge(params: {
    gender: Gender;
    ageCategory: NarratorAgeCategory;
  }): Promise<Narrator | null> {
    return new Promise((resolve, reject) => {
      const { gender, ageCategory } = params;
      this.narratorModel.find({ gender, ageCategory }).then((narrators) => {
        if (narrators.length > 0) {
          resolve(narrators[0]);
        } else {
          reject(null);
        }
      });
    });
  }

  /**
   * This method is used to save the narrators to the database for the first time only.
   * It checks if the narrators exist in the database, if not, it creates them.
   *
   * `Important:` this method should be called only once.
   */
  createDefaultNarrators(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.findAll().then((narrators) => {
        const narratorsToInsert: Omit<PublicNarrator, 'id'>[] = [];
        this.defaultNarrators.forEach((narrator) => {
          if (!narrators.some((n) => n.ageCategory === narrator.ageCategory)) {
            narratorsToInsert.push(narrator);
          }
        });

        if (narratorsToInsert.length > 0) {
          this.narratorModel
            .insertMany(narratorsToInsert)
            .then(() => {
              resolve();
            })
            .catch((error) => {
              this.logger.error(error);
              reject(error);
            });
        }
      });
    });
  }
}
