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

export enum StoryScenario {
  'HOUSE' = 'HOUSE',
  'APARTMENT' = 'APARTMENT',
  'SCHOOL' = 'SCHOOL',
  'RESTAURANT' = 'RESTAURANT',
  'HOTEL' = 'HOTEL',
  'NATURE' = 'NATURE',
  'FOREST_KINGDOM' = 'FOREST_KINGDOM',
  'WIZARD_SCHOOL' = 'WIZARD_SCHOOL',
  'CITY' = 'CITY',
  'OTHER' = 'OTHER',
}

// export enum SolveProblemPurpose {
//   'FRIENDS' = 'FRIENDS',
//   'FAMILY' = 'FAMILY',
//   'BEHAVIOR' = 'BEHAVIOR',
//   'SIBLINGS' = 'SIBLINGS',
//   'PARENTS' = 'PARENTS',
//   'OTHER' = 'OTHER',
// }

// export enum TeachSomethingPurpose {
//   'VALUES' = 'VALUES',
//   'EMOTIONS' = 'EMOTIONS',
//   'ACADEMICS' = 'ACADEMICS',
//   'OTHER' = 'OTHER',
// }

export enum GeneralPurpose {
  'VALUES' = 'VALUES',
  'EMOTIONS' = 'EMOTIONS',
  'ACADEMICS' = 'ACADEMICS',
  'FRIENDS' = 'FRIENDS',
  'FAMILY' = 'FAMILY',
  'BEHAVIOR' = 'BEHAVIOR',
  'SIBLINGS' = 'SIBLINGS',
  'PARENTS' = 'PARENTS',
  'SCHOOL' = 'SCHOOL',
  'SLEEP' = 'SLEEP',
  'SPORTS' = 'SPORTS',
  'OTHER' = 'OTHER',
}

export enum Focus {
  // Values
  'RESPECT' = 'RESPECT',
  'KINDNESS' = 'KINDNESS',
  'HONESTY' = 'HONESTY',
  'RESPONSIBILITY' = 'RESPONSIBILITY',
  'EMPATHY' = 'EMPATHY',
  'PERSEVERANCE' = 'PERSEVERANCE',
  // Emotions
  'HAPPY' = 'HAPPY',
  'FRUSTRATED' = 'FRUSTRATED',
  'EMBARASSED' = 'EMBARASSED',
  'JOYFUL' = 'JOYFUL',
  'CALM' = 'CALM',
  'SAD' = 'SAD',
  'SCARED' = 'SCARED',
  'ANGRY' = 'ANGRY',
  'SCARE' = 'SCARE',
  'ANXIOUS' = 'ANXIOUS',
  // Academics
  'ART' = 'ART',
  'BIOLOGY' = 'BIOLOGY',
  'CHEMISTRY' = 'CHEMISTRY',
  'GEOGRAPHY' = 'GEOGRAPHY',
  'HISTORY' = 'HISTORY',
  'LITERATURE' = 'LITERATURE',
  'MATHEMATICS' = 'MATHEMATICS',
  'MONEY' = 'MONEY',
  // Sports
  'SOCCER' = 'SOCCER',
  'SWIMMING' = 'SWIMMING',
  'GYMNASTICS' = 'GYMNASTICS',
  'BASEBALL' = 'BASEBALL',
  'BASKETBALL' = 'BASKETBALL',
  'FOOTBALL' = 'FOOTBALL',
  // Other
  'OTHER' = 'OTHER',
}

export enum MainCharacter {
  'GIRL' = 'GIRL',
  'BOY' = 'BOY',
  'DOG' = 'DOG',
  'CAT' = 'CAT',
  'HERO' = 'HERO',
  'KING' = 'KING',
  'PRINCESS' = 'PRINCESS',
  'OTHER' = 'OTHER',
}
