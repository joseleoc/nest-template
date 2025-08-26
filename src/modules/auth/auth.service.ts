import { JwtService } from '@nestjs/jwt';
import { HttpStatus, Injectable } from '@nestjs/common';

import { UsersService } from '@/modules/users';
import { User } from '../users/entities/user.entity';
import { ValidateUserDTO } from './dto/auth.dto';
import createHttpError from 'http-errors';

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
    try {
      const user = await this.usersService.findUserByUserName(username);
      if (user && user.password === password) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...returnedUser } = user;
        return returnedUser;
      } else {
        throw createHttpError(HttpStatus.UNAUTHORIZED, 'Unauthorized');
      }
    } catch (error) {
      throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }
}
