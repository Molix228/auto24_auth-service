import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/user/user.repository';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { QueryFailedError } from 'typeorm';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from '../types/responses/login-response.interface';
import { IAuthService } from 'src/interfaces';
import {
  ACCESS_JWT_SERVICE,
  REFRESH_JWT_SERVICE,
} from 'src/token-service/token-service.service';
import { TokenRepository } from 'src/token-service/token.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly configService: ConfigService,
    @Inject(ACCESS_JWT_SERVICE) private readonly accessJwtService: JwtService,
    @Inject(REFRESH_JWT_SERVICE) private readonly refreshJwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<Partial<User>> {
    // TO FIX: Caching logic to be fixed later
    // const cacheKey = `username:${createUserDto.username}`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    try {
      const newUser = await this.userRepository.create({
        ...createUserDto,
        passwordHash,
        salt,
      });
      this.logger.log('User registered:', newUser);

      // --- TO FIX: Caching logic to be fixed later ---
      // this.logger.debug(
      //   `[AuthService] Attempting to set cache for key: ${cacheKey}`,
      // );
      // await this.cacheManager.set(cacheKey, createUserDto.username, 3600);
      // const redis_data = await this.cacheManager.get<User>(cacheKey);
      // this.logger.log('User from REDIS:', redis_data);
      // if (redis_data) {
      //   this.logger.debug(
      //     `[AuthService] Successfully set cache for key: ${JSON.stringify(redis_data)}`,
      //   );
      //   return redis_data;
      // }

      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      };
    } catch (error) {
      // --- IMPROVED BUG LOGS WITHIN THE SERVICE ---
      this.logger.error('[AuthService] ERROR in register method:', error);
      this.logger.error('[AuthService] Error message:', error.message);
      if (error instanceof QueryFailedError) {
        this.logger.error(
          '[AuthService] QueryFailedError code:',
          (error as any).code,
        );
        if ((error as any).code === '23505') {
          throw new ConflictException('User with such email already exists.');
        }
      }
      // Pass as InternalServerErrorException so that AllExceptionsFilter can catch it
      // and send back the API Gateway (if send is used).
      throw new InternalServerErrorException(
        'Unable to register user due to unexpected error.',
        error.message,
      );
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const user = await this.userRepository.findByUsername(
      loginUserDto.username,
    );
    if (!user) {
      throw new UnauthorizedException('User or password is incorrect');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user?.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('User or password is incorrect');
    }
    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = await this.accessJwtService.signAsync(payload);
    const refreshToken = await this.refreshJwtService.signAsync(payload);

    try {
      await this.tokenRepository.revokeAllUserTokens(user.id);
      const expiresIn =
        this.configService.get<string>('REFRESH_JWT_EXPIRATION') || '7d';

      await this.tokenRepository.createToken(user.id, refreshToken, expiresIn);

      this.logger.log(
        `[AuthService] New refresh token stored for user: ${user.username}`,
      );
    } catch (error) {
      this.logger.error(
        '[AuthService] Failed to store refreshToken',
        error.stack,
      );
      throw new InternalServerErrorException('Error processing login');
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = await this.accessJwtService.verify(token);
      return { valid: true, userId: payload.sub, username: payload.username };
    } catch (error) {
      return { valid: false, userId: null, username: null };
    }
  }

  async validateRefreshToken(token: string) {
    try {
      const payload = await this.refreshJwtService.verify(token);
      return { valid: true, userId: payload.sub, username: payload.username };
    } catch (err) {
      return { valid: false, userId: null, username: null };
    }
  }

  async refreshAccessToken(token: string): Promise<any> {
    const dbToken = await this.tokenRepository.findActiveToken(token);

    if (!dbToken) {
      this.logger.warn(
        `[AuthService] Attempt to use revoked or non-existent token`,
      );
      throw new UnauthorizedException('Refresh token is invalid');
    }

    if (new Date() > dbToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    try {
      const payload = await this.refreshJwtService.verifyAsync(token);
      const newPayload = { sub: payload.sub, username: payload.username };
      const accessToken = await this.accessJwtService.signAsync(newPayload);
      return { accessToken };
    } catch (error) {
      this.logger.warn(
        '[AuthService] JWT Verify failed during refresh',
        error.message,
      );
      throw new UnauthorizedException('Invalid token signature');
    }
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      await this.tokenRepository.revokeToken(token);
      this.logger.log('[AuthService] Token successfully revoked.');
      return true;
    } catch (error) {
      this.logger.error('[AuthService] Error revoking token', error.stack);
      return false;
    }
  }
}
