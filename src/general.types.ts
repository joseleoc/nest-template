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

  constructor(params: { page: number; limit: number }) {
    this.page = params.page < 0 ? 0 : params.page;
    this.limit = params.limit <= 0 ? 10 : params.limit;
  }
}

export type PaginatedResponse<T> = {
  data: T[];
  totalSearch: number;
};
