export interface ENVIRONMENT {
  GENERAL: {
    NODE_ENV?: string;
    PORT?: string;
    JWT_SECRET?: string;
    APP_SALT?: string;
  };
  DB: {
    DB_URL?: string;
    DB_NAME?: string;
  };
  OPENAI: {
    OPENAI_API_KEY?: string;
    OPENAI_PROJECT?: string;
    OPENAI_ORGANIZATION?: string;
  };
  AWS: {
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_REGION_NAME?: string;
    AWS_S3_BUCKET_NAME?: string;
  };
  ELEVENLABS: {
    ELEVENLABS_API_KEY?: string;
  };
  STRIPE_CONFIG: {
    apiKey?: string;
    webhookConfig?: {
      requestBodyProperty?: string;
      stripeSecrets?: {
        account?: string;
        accountTest?: string;
        connect?: string;
        connectTest?: string;
      };
      decorators?: any[];
    };
  };
}

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
