import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { UsersService } from '@/modules/users';
import { AuthPayloadDto } from './dto/auth.dto';
import { UserDocument } from '../users/schemas/user.schema';

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

  async validateUser({ username, password }: AuthPayloadDto): Promise<any> {
    return new Promise(async (resolve: (value: any) => void, reject) => {
      try {
        const user = await this.usersService.findOneByUserName(username);

        if (user && user.password === password) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...returnedUser } = user;
          resolve(returnedUser);
        } else {
          reject(null);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
