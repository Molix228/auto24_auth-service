import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PasswordHashingModule } from 'src/password-hashing/password-hashing.module';
import { TokenServiceModule } from 'src/token-service/token-service.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/entities/token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UserModule,
    PasswordHashingModule,
    TokenServiceModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
