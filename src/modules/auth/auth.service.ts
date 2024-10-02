import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { UsersService } from '@/modules/users';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ValidateUserDTO } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: UserDocument) {
    const payload = { username: user.userName, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser({
    username,
    password,
  }: ValidateUserDTO): Promise<Omit<User, 'password'>> {
    return new Promise(async (resolve: (value: any) => void, reject) => {
      try {
        this.usersService
          .findOneByUserName(username)
          .then((user) => {
            if (user == null) {
              resolve(null);
              return;
            }

            compare(password, user.password)
              .then((valid) => {
                if (valid) {
                  delete user.password;
                  resolve(user);
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
