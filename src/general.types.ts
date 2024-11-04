export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum Language {
  EN = 'en',
  ES = 'es',
}

export class PaginatedData {
  page: number;
  limit: number;

  constructor(page: number, limit: number) {
    this.page = page <= 0 ? 0 : page;
    this.limit = limit <= 0 ? 10 : limit;
  }
}

export type PaginatedResponse<T> = {
  data: T[];
  totalSearch: number;
};
