import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { deserialize } from 'v8';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<string>('REDIS_PORT');
        const redisUser = configService.get<string>('REDIS_USER');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        const redisTtl = configService.get<number>('REDIS_TTL');
        // -----------------------

        return {
          store: redisStore,
          host: redisHost,
          port: parseInt(redisPort!, 10),
          username: redisUser,
          password: redisPassword,
          ttl: redisTtl,
          enableOfflineQueue: false,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
