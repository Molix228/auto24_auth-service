import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { deserialize } from 'v8';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<string>('REDIS_PORT');
        const redisUser = configService.get<string>('REDIS_USER');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        const redisTtl = configService.get<number>('REDIS_TTL');

        console.log(`[CacheModule Init] REDIS_HOST: ${redisHost}`);
        console.log(`[CacheModule Init] REDIS_PORT: ${redisPort}`);
        console.log(`[CacheModule Init] REDIS_USER: ${redisUser}`);
        console.log(
          `[CacheModule Init] REDIS_PASSWORD: ${redisPassword ? '***' : 'N/A'}`,
        ); // Не логируйте пароль
        console.log(`[CacheModule Init] REDIS_TTL: ${redisTtl}`);
        // -----------------------

        return {
          store: redisStore,
          host: redisHost || 'localhost',
          port: parseInt(redisPort ?? '6379', 10),
          username: redisUser,
          password: redisPassword,
          ttl: redisTtl || 3600,
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
