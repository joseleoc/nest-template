import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { UsersService } from '@/modules/users';
import { UserDocument } from '../users/schemas/user.schema';

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
    user: UserDocument,
  ): Promise<{ access_token: string; userId: string }> {
    const payload = { username: user.userName, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      userId: user.id,
    };
  }

  async validateUser({
    username,
    password,
  }: ValidateUser): Promise<PublicUser | null> {
    return new Promise(async (resolve, reject) => {
      try {
        this.usersService
          .findUserDocumentByUserName(username)
          .then((user) => {
            if (user == null) {
              resolve(null);
              return;
            }

            const userPassword = user.password ?? '';
            this.utilsService
              .validatePassword({
                strLiteral: password,
                userPassword,
              })
              .then((valid) => {
                if (valid) {
                  delete user.password;
                  resolve(new PublicUser(user));
                } else {
                  reject(null);
                }
              })
              .catch(() => resolve(null));
          })
          .catch((error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }
}
