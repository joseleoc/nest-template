import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import appConfig from './app.config';

export const jwtConfig: JwtModuleAsyncOptions = {
  global: true,
  useFactory: async () => {
    return {
      secret: appConfig().GENERAL.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    };
  },
};
