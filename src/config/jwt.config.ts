import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import appConfig from './app.config';

export const jwtConfig: JwtModuleAsyncOptions = {
  global: true,
  useFactory: async () => {
    return {
      secret: appConfig().jwtSecret,
      signOptions: { expiresIn: '30d' },
    };
  },
};
