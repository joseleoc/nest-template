import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { forwardRef, Module } from '@nestjs/common';
import { jwtConfig } from '@/config/jwt.config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@/modules/users/users.module';
import { ServicesModule } from '@/services/services.module';

import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.registerAsync(jwtConfig),
    ServicesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
