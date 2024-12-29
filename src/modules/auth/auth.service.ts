import { JwtService } from '@nestjs/jwt';
import { HttpStatus, Injectable } from '@nestjs/common';

import { UsersService } from '@/modules/users';

import { PublicUser } from '../users/types/users.types';
import { UtilsService } from '@/services/utils/utils.service';
import { ValidateUser } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private utilsService: UtilsService,
  ) {}

  async login(
    userName: string,
  ): Promise<{ access_token: string; userId: string }> {
    return new Promise((resolve, reject) => {
      this.validateUser({ username: userName })
        .then((user) => {
          if (user == null) {
            reject({
              message: 'User not found',
              code: HttpStatus.NOT_FOUND,
            });
            return;
          }
          const payload = { username: user.userName, userId: user.id };
          resolve({
            access_token: this.jwtService.sign(payload),
            userId: user.id,
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async validateUser({ username }: ValidateUser): Promise<PublicUser | null> {
    return new Promise(async (resolve, reject) => {
      try {
        this.usersService
          .findUserDocumentByUserName(username)
          .then((user) => {
            if (user == null) {
              resolve(null);
              return;
            }
            resolve(new PublicUser(user));

            // Don't use password validation, it is handled by the firebase auth.
            // const userPassword = user.password ?? '';

            // this.utilsService
            //   .validatePassword({
            //     strLiteral: password,
            //     userPassword,
            //   })
            //   .then((valid) => {
            //     if (valid) {
            //       delete user.password;
            //     } else {
            //       reject(null);
            //     }
            //   })
            //   .catch(() => resolve(null));
          })
          .catch((error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }
}
