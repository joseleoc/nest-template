import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { Story, StorySchema } from './schemas/stories.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users';
import { ChildrenModule } from '../children/children.module';
import { ServicesModule } from '@/services/services.module';
import { NarratorsModule } from '../narrators/narrators.module';

@Module({
  imports: [
    UsersModule,
    ServicesModule,
    ChildrenModule,
    NarratorsModule,
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}
