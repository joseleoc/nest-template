import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LocalAuthGuard } from '@/guards/index';
import { SkipAuth } from '@/decorators/index';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
