import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { UsersService } from '@/modules/users';
import { User } from '../users/entities/user.entity';
import { ValidateUserDTO } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: Omit<User, 'password'>): Promise<{ access_token: string }> {
    const payload = { username: user.userName, sub: user.userId };
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
        const user = await this.usersService.findUserByUserName(username);
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
