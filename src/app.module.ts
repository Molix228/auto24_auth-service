import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PasswordHashingModule } from './password-hashing/password-hashing.module';
import { TokenServiceModule } from './token-service/token-service.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    HealthModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    PasswordHashingModule,
    TokenServiceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
