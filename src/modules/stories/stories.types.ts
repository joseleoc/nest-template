import {
  StoriesReportDocument,
  StoriesReports,
} from './schemas/stories-reports.schema';
import { Story, StoryDocument } from './schemas/stories.schema';

export class PublicStory extends Story {
  id: string;
  liked?: boolean;
  createdBy?: string;
  constructor(story: StoryDocument) {
    const data = story.toObject();
    super();
    this.id = data._id.toString();
    Object.assign(this, data);
  }
}

export type StoryCounterParams = {
  storyId: string;
  userId: string;
};

export class PublicReport extends StoriesReports {
  id: string;
  constructor(report: StoriesReportDocument) {
    super();
    const data = report.toObject();
    this.storyId = data.storyId;
    this.userId = data.userId;
    this.id = data._id.toString();
    this.reason = data.reason;
  }
}
