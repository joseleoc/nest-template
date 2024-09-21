import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';

import { SkipAuth } from '@/decorators/index';
import { LocalAuthGuard } from '@/guards/index';

import { AuthService } from './auth.service';
import { LoginRequestBody, LoginResponseBody } from './auth.constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @ApiOperation(LoginRequestBody)
  @ApiResponse(LoginResponseBody)
  async login(@Request() req, @Body() body) {
    console.log({ body });
    console.log('Controller auth login', req);
    return this.authService.login(req.user);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
