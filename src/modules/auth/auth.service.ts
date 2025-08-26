import { JwtService } from '@nestjs/jwt';
import { HttpStatus, Injectable } from '@nestjs/common';

import { UsersService } from '@/modules/users';
import { User } from '../users/entities/user.entity';
import { LoginDTO } from './dto/auth.dto';
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
    userName,
    password,
  }: LoginDTO): Promise<Omit<User, 'password'>> {
    console.log('🚀 ~ AuthService ~ validateUser ~ LoginDTO:', LoginDTO);
    try {
      const user = await this.usersService.findUserByUserName(userName);
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
