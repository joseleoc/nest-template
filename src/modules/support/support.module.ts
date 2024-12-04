import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Support, SupportSchema } from './schemas/support.schema';
import {
  SupportTypes,
  SupportTypesSchema,
} from './schemas/support-types.schema';

@Module({
  controllers: [SupportController],
  providers: [SupportService],
  imports: [
    MongooseModule.forFeature([
      { name: Support.name, schema: SupportSchema },
      { name: SupportTypes.name, schema: SupportTypesSchema },
    ]),
  ],
})
export class SupportModule {}
