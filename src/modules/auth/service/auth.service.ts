import { UsersService } from '@/modules/users';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // async login(payload: any): Promise<{ access_token: string }> {
  //   const user = await this.usersService.findOne(payload.username);
  //   if (user?.password !== payload.password) {
  //     throw new UnauthorizedException();
  //   }
  //   const sub = { sub: user.userId, username: user.username };
  //   return {
  //     access_token: await this.jwtService.signAsync(sub),
  //   };
  // }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
