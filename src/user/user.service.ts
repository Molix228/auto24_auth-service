import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserProfile } from 'src/dto/update-user.dto';
import { UserRepository } from 'src/user/user.repository';
import { SafeUser } from 'src/types';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly userRepository: UserRepository) {}
  async checkExistingUser(username: string) {
    // TO FIX: Caching logic to be fixed later
    // const cacheKey = `username:${username}`;
    // const cachedEmailExists = await this.cacheManager.get<User>(cacheKey);
    // this.logger.log('Cached username:', cachedEmailExists);
    // if (cachedEmailExists !== undefined && cachedEmailExists !== null) {
    //   throw new ConflictException('User already exists(from cache)');
    // }
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      // await this.cacheManager.set(cacheKey, username, 3600);
      throw new ConflictException('User already exists(from DB)');
    }
    return;
  }

  async getUserProfile(id: string): Promise<SafeUser> {
    try {
      const user = await this.userRepository.findById(id);
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
        throw new InternalServerErrorException('USER cannot be deleted in DB');
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
