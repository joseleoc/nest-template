import { Module } from '@nestjs/common';
import { NarratorsService } from './narrators.service';
import { NarratorsController } from './narrators.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Narrator, NarratorSchema } from './schemas/narrators.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Narrator.name, schema: NarratorSchema },
    ]),
  ],
  controllers: [NarratorsController],
  providers: [NarratorsService],
  exports: [NarratorsService],
})
export class NarratorsModule {}
