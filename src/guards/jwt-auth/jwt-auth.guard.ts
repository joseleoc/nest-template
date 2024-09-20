import { CAN_SKIP_AUTH_KEY } from '@/decorators';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const canSkipAuth = this.reflector.getAllAndOverride<boolean>(
      CAN_SKIP_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (canSkipAuth) {
      return true;
    }
    return super.canActivate(context);
  }
}
