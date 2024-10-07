import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

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
  async login(@Request() req, @Res() res: Response) {
    try {
      this.authService
        .login(req.user)
        .then((access) => {
          res.status(HttpStatus.OK).json(access);
        })
        .catch((error) => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
    }
  }
}
