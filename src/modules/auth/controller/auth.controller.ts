import { Controller } from '@nestjs/common';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @HttpCode(HttpStatus.OK)
  // @Post('login')
  // signIn(@Body() signInDto: Record<string, any>) {
  //   return this.authService.signIn(signInDto.username, signInDto.password);
  // }

  // @SkipAuth()
  // @UseGuards(LocalAuthGuard)
  // @Post('auth/login')
  // async login(@Request() req) {
  //   return this.authService.login(req.user);
  // }

  // @UseGuards(AuthGuard)
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }
}
