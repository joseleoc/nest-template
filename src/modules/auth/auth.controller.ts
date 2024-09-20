import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';

import { SkipAuth } from '@/decorators/index';
import { LocalAuthGuard } from '@/guards/index';

import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Create cat' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
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
