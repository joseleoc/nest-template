import * as process from 'process';

export default () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  GLOBAL: {
    PORT: process.env.PORT || 3000,
  },
  jwtSecret: process.env.JWT_SECRET,
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
