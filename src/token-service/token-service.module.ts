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
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/entities/token.entity';
import { TokenRepository } from './token.repository';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    PassportModule,
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  providers: [...TokenService.getJwtProviders(), TokenRepository],
  exports: [ACCESS_JWT_SERVICE, REFRESH_JWT_SERVICE, TokenRepository],
})
export class TokenServiceModule {}
