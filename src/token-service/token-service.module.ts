import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/auth/configs/jwt.config';
import refreshJwtConfig from 'src/auth/configs/refresh-jwt.config';
import { PassportModule } from '@nestjs/passport';
import {
  ACCESS_JWT_SERVICE,
  REFRESH_JWT_SERVICE,
  TokenService,
} from './token-service.service';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    PassportModule,
  ],
  providers: [...TokenService.getJwtProviders()],
  exports: [ACCESS_JWT_SERVICE, REFRESH_JWT_SERVICE],
})
export class TokenServiceModule {}
