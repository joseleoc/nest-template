import {
  StoriesReportDocument,
  StoriesReports,
} from '../schemas/stories-reports.schema';

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

export enum StoryStyle {
  'FICTIONAL' = 'FICTIONAL',
  'NON_FICTIONAL' = 'NON_FICTIONAL',
}

export enum StoryCore {
  'SOLVING_PROBLEM' = 'SOLVING_PROBLEM',
  'TEACHING_SOMETHING' = 'TEACHING_SOMETHING',
  'OTHER' = 'OTHER',
}

export enum StoryPurpose {
  'FRIENDS' = 'FRIENDS',
  'FAMILY' = 'FAMILY',
  'BEHAVIOR' = 'BEHAVIOR',
  'SIBLINGS' = 'SIBLINGS',
  'PARENTS' = 'PARENTS',
  'VALUES' = 'VALUES',
  'EMOTIONS' = 'EMOTIONS',
  'ACADEMICS' = 'ACADEMICS',
  'OTHER' = 'OTHER',
}

export enum StoryScenario {
  'FOREST_KINGDOM' = 'FOREST_KINGDOM',
  'WIZARDING_SCHOOL' = 'WIZARDING_SCHOOL',
  'CITY' = 'CITY',
  'RESTAURANT' = 'RESTAURANT',
  'HOUSE' = 'HOUSE',
  'SCHOOL' = 'SCHOOL',
  'OTHER' = 'OTHER',
}
