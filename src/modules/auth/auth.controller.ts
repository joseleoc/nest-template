import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  Res,
  Logger,
  Body,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';

import { SkipAuth } from '@/decorators/index';
import { LocalAuthGuard } from '@/guards/index';

import { AuthService } from './auth.service';
import { LoginRequestBody, LoginResponseBody } from './auth.constants';
import { ZodValidationPipe } from 'nestjs-zod';
import { LoginDto, LoginDtoSchema } from './dto/login.dto';

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
  @UsePipes(new ZodValidationPipe(LoginDtoSchema))
  @ApiOperation(LoginRequestBody)
  @ApiResponse(LoginResponseBody)
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not found or password is wrong',
  })
  async login(@Body() params: LoginDto, @Res() res: Response) {
    this.authService
      .login(params.username)
      .then((access) => {
        res.status(HttpStatus.OK).json(access);
      })
      .catch((error) => {
        this.logger.error(error);
        if (error?.code != null) {
          res.status(error.code).json(error);
          return;
        }
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
      });
  }
}
