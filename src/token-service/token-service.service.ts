import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export const ACCESS_JWT_SERVICE = 'ACCESS_JWT_SERVICE';
export const REFRESH_JWT_SERVICE = 'REFRESH_JWT_SERVICE';

export class TokenService {
  public static getJwtProviders(): Provider[] {
    return [
      {
        provide: ACCESS_JWT_SERVICE,
        useFactory: (configService: ConfigService) =>
          new JwtService({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: {
              expiresIn: configService.get<string>('JWT_EXPIRATION'),
            },
          }),
        inject: [ConfigService],
      },
      {
        provide: REFRESH_JWT_SERVICE,
        useFactory: (configService: ConfigService) =>
          new JwtService({
            secret: configService.get<string>('REFRESH_JWT_SECRET'),
            signOptions: {
              expiresIn: configService.get<string>('REFRESH_JWT_EXPIRATION'),
            },
          }),
        inject: [ConfigService],
      },
    ];
  }
}
