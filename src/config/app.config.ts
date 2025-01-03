import * as process from 'process';

export default () => ({
  GENERAL: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    APP_SALT: process.env.APP_SALT,
  },
  DB: {
    DB_URL: process.env.DB_URL,
    DB_NAME: process.env.DB_NAME,
  },
  OPENAI: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_PROJECT: process.env.OPENAI_PROJECT,
    OPENAI_ORGANIZATION: process.env.OPENAI_ORGANIZATION,
  },
  AWS: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION_NAME: process.env.AWS_REGION_NAME,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  },
  ELEVENLABS: {
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  },
  STRIPE_CONFIG: {
    apiKey: process.env.STRIPE_SECRET_KEY,
    webhookConfig: {
      requestBodyProperty: 'rawBody',
      stripeSecrets: {
        account: process.env.STRIPE_WEBHOOK_SECRET,
        accountTest: process.env.STRIPE_WEBHOOK_SECRET_TEST,
        connect: process.env.STRIPE_WEBHOOK_SECRET_CONNECT,
        connectTest: process.env.STRIPE_WEBHOOK_SECRET_CONNECT_TEST,
      },
    },
  },
});
