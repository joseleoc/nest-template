/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Narrator, NarratorAgeCategory } from './schemas/narrators.schema';
import { Model } from 'mongoose';
import { Gender, Language } from '@/types/general.types';
import { PublicNarrator } from './types/narrators.types';
import { UpdateNarratorDto } from './dto/update-narrator.dto';

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
      ageCategory: NarratorAgeCategory.ELDERLY,
      language: Language.EN,
    },
    {
      name: 'José Borda - Deep',
      voiceId: 'NDeNvFOosDh4L0JoDYIq',
      gender: Gender.MALE,
      ageCategory: NarratorAgeCategory.ELDERLY,
      language: Language.ES,
    },
    {
      name: 'Brian Overturf',
      voiceId: 'ryn3WBvkCsp4dPZksMIf',
      gender: Gender.MALE,
      ageCategory: NarratorAgeCategory.ADULT,
      language: Language.EN,
    },
    {
      name: 'Dan Dan',
      voiceId: '9F4C8ztpNUmXkdDDbz3J',
      gender: Gender.MALE,
      ageCategory: NarratorAgeCategory.ADULT,
      language: Language.ES,
    },
    {
      name: 'Tyler Kurk',
      voiceId: 'raMcNf2S8wCmuaBcyI6E',
      gender: Gender.MALE,
      ageCategory: NarratorAgeCategory.TEENAGER,
      language: Language.EN,
    },
    {
      name: 'A-Chan ver.2',
      voiceId: 'VyTe5Cy1ZXnpHrKVrxwk',
      gender: Gender.MALE,
      ageCategory: NarratorAgeCategory.CHILD,
      language: Language.EN,
    },
    {
      name: 'Nora',
      voiceId: '0YCdTbygrMV0VFUAAziF',
      gender: Gender.FEMALE,
      ageCategory: NarratorAgeCategory.ELDERLY,
      language: Language.EN,
    },
    {
      name: 'Omgpvoice - Expressive',
      voiceId: 'IZ0jPQ3xydXtRUdWOhNs',
      gender: Gender.FEMALE,
      ageCategory: NarratorAgeCategory.TEENAGER,
      language: Language.ES,
    },
    {
      name: 'Alicia Speaks-Unique and Pleasant',
      voiceId: 'OOk3INdXVLRmSaQoAX9D',
      gender: Gender.FEMALE,
      ageCategory: NarratorAgeCategory.ADULT,
      language: Language.EN,
    },
    {
      name: 'Samanta',
      voiceId: 'qBvury71WUJfVeT1STkG',
      gender: Gender.FEMALE,
      ageCategory: NarratorAgeCategory.ADULT,
      language: Language.ES,
    },
    {
      name: 'Hope - upbeat and clear',
      voiceId: 'tnSpp4vdxKPjI9w0GnoV',
      gender: Gender.FEMALE,
      ageCategory: NarratorAgeCategory.TEENAGER,
      language: Language.EN,
    },
    {
      name: 'Gigi (Legacy)',
      voiceId: 'jBpfuIE2acCO8z3wKNLl',
      gender: Gender.FEMALE,
      ageCategory: NarratorAgeCategory.CHILD,
      language: Language.EN,
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

  findOne(params: {
    gender: Gender;
    ageCategory: NarratorAgeCategory;
    language?: Language;
  }): Promise<PublicNarrator | null> {
    return new Promise((resolve, reject) => {
      const { gender, ageCategory, language } = params;
      this.narratorModel
        .findOne({ gender, ageCategory, language: language || Language.EN })
        .then((narrator) => {
          if (narrator != null) {
            return new PublicNarrator(narrator);
          } else if (language != null) {
            // Try to find the narrator with the default language
            return this.findOne({
              gender,
              ageCategory,
            });
          } else {
            return null;
          }
        })
        .then((narrator) => {
          if (narrator != null) {
            resolve(narrator);
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
          if (
            !narrators.some(
              (n) =>
                n.ageCategory === narrator.ageCategory &&
                narrator.language === n.language,
            )
          ) {
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

  updateNarrator(params: UpdateNarratorDto): Promise<PublicNarrator | null> {
    return new Promise((resolve, reject) => {
      const { id, ...other } = params;
      this.narratorModel
        .findByIdAndUpdate(id, params, { new: true })
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
}
