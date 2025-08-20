import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/auth/user.repository';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { QueryFailedError } from 'typeorm';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from './types/login-response.interface';
import { SafeUser } from './types/safe-user.interface';
import { JwtPayload } from './types/jwt-payload.interface';
import { UpdateUserProfile } from 'src/dto/update-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async checkExistingUser(username: string) {
    const cacheKey = `username:${username}`;
    const cachedEmailExists = await this.cacheManager.get(cacheKey);
    if (cachedEmailExists) {
      throw new ConflictException('User already exists(from cache)');
    }
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      await this.cacheManager.set(cacheKey, username, 3600);
      throw new ConflictException('User already exists(from DB)');
    }
    return;
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const cacheKey = `username:${createUserDto.username}`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    try {
      const newUser = await this.userRepository.create({
        ...createUserDto,
        passwordHash,
        salt,
      });

      this.logger.debug(
        `[AuthService] Attempting to set cache for key: ${cacheKey}`,
      );
      await this.cacheManager.set(cacheKey, createUserDto.username, 3600);
      const redis_data = await this.cacheManager.get<User>(cacheKey);
      this.logger.log('User from REDIS:', redis_data);
      if (redis_data) {
        this.logger.debug(
          `[AuthService] Successfully set cache for key: ${JSON.stringify(redis_data)}`,
        );
        return redis_data;
      }

      return newUser;
    } catch (error) {
      // --- УЛУЧШЕННЫЕ ЛОГИ ОШИБОК ВНУТРИ СЕРВИСА ---
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
      // Перебрасываем как InternalServerErrorException, чтобы AllExceptionsFilter мог ее поймать
      // и отправить обратно API Gateway (если используется send).
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
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token);
      return { valid: true, userId: payload.sub, username: payload.username };
    } catch (error) {
      return { valid: false, userId: null, username: null };
    }
  }

  async getUserProfile(id: string): Promise<SafeUser> {
    try {
      const user = await this.userRepository.findById(id);
      console.log(user);
      if (!user) throw new NotFoundException('User Not Found [PostgreSQL]');
      const { passwordHash, salt, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      throw new InternalServerErrorException(
        'User cannot be found [PostgreSQL]',
        error.message,
      );
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user)
        throw new NotFoundException(
          `User with ID: ${id} not found [PostgreSQL]`,
        );
      const isDeleted = await this.userRepository.delete(id);
      if (!isDeleted)
        throw new InternalServerErrorException('DB cannot delete the USER');
      this.logger.log('Deleted!');
      return isDeleted;
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong',
        err.message,
      );
    }
  }

  async updateProfile(
    id: string,
    dataToUpdate: Partial<UpdateUserProfile>,
  ): Promise<SafeUser> {
    try {
      const updatedUser = await this.userRepository.update(id, dataToUpdate);

      if (!updatedUser) {
        throw new NotFoundException(
          `User with ID: ${id} not found [PostgreSQL]`,
        );
      }

      const { passwordHash, salt, ...safeUser } = updatedUser;
      return safeUser;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Something went wrong',
        err.message,
      );
    }
  }
}
