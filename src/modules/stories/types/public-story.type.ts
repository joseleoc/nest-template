import { Story, StoryDocument } from '../schemas/stories.schema';

export class PublicStory extends Story {
  id: string;
  liked?: boolean;
  createdBy?: string;
  constructor(story: StoryDocument) {
    super();
    const data = story.toObject();
    this.id = data._id.toString();
    delete (data as any)._id;
    delete (data as any).contentImageDescription;
    delete data.scenarioDescription;
    delete data.purposeDescription;
    delete data.characterDescription;
    Object.assign(this, data);
  }
}
