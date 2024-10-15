import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  Res,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import { SkipAuth } from '@/decorators/index';
import { LocalAuthGuard } from '@/guards/index';

import { AuthService } from './auth.service';
import { LoginRequestBody, LoginResponseBody } from './auth.constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  // --------------------------------------------------------------------------------
  // Local properties
  // --------------------------------------------------------------------------------
  private readonly logger = new Logger(AuthController.name);

  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(private authService: AuthService) {}

  @Post('login')
  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @ApiOperation(LoginRequestBody)
  @ApiResponse(LoginResponseBody)
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not found or password is wrong',
  })
  async login(@Request() req, @Res() res: Response) {
    try {
      this.authService
        .login(req.user)
        .then((access) => {
          res.status(HttpStatus.OK).json(access);
        })
        .catch((error) => {
          this.logger.error(error);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
        });
    } catch (error) {
      this.logger.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
    }
  }
}
