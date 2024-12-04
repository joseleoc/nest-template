import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Support } from './schemas/support.schema';
import { CreateSupportDto } from './dto/create-support.dto';
import { SupportTypes } from './schemas/support-types.schema';
import { DefaultSupportTypes } from './constants/default-support-types';

@Injectable()
export class SupportService {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger(SupportService.name);
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(
    @InjectModel(Support.name) private readonly supportModel: Model<Support>,
    @InjectModel(SupportTypes.name)
    private readonly supportTypesModel: Model<SupportTypes>,
  ) {
    this.createDefaultSupportTypes();
  }

  // --------------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------------
  /**
   * This method is used to save the supports types to the database for the first time only.
   *
   * It checks if the supportTypes already exists in the database, if not, it creates them.
   *
   * `Important:` this method should be called only once.
   *
   * @returns A promise that resolves a void value.
   */
  private createDefaultSupportTypes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.supportTypesModel.find().then((existingTypes) => {
        const documentsToCreate = DefaultSupportTypes.filter(
          (type) =>
            !existingTypes.some(
              (existingType) => existingType.type === type.type,
            ),
        );
        if (documentsToCreate.length === 0) {
          resolve();
          return;
        }
        this.supportTypesModel
          .insertMany(documentsToCreate)
          .then(() => resolve())
          .catch((error) => {
            this.logger.error(error);
            reject(error);
          });
      });
    });
  }
  // --------------------------------------------------------------------------------
  // Public Methods
  // --------------------------------------------------------------------------------
  submitSupport(params: CreateSupportDto) {
    return new Promise((resolve) => {
      resolve(params);
    });
  }
}
