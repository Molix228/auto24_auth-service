import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') ||
          'b7961670da161a5b1b838ec38148be33',
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRATION'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository],
  exports: [AuthService],
})
export class AuthModule {}
