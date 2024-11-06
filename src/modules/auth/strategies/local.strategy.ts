import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { PublicUser } from '@/modules/users/types/users.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * Used by the local strategy to validate a user's credentials with the passport library.
   */
  async validate(username: string, password: string): Promise<PublicUser> {
    return new Promise(async (resolve, reject) => {
      this.authService
        .validateUser({
          username,
          password,
        })
        .then((user) => {
          if (!user) {
            throw new UnauthorizedException();
          }
          resolve(user);
        })
        .catch((error) => reject(error));
    });
  }
}
