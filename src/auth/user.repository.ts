import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findById(sub: string): Promise<User | null> {
    try {
      console.log(`[UserRepository] Request to PostgreSQL: findById(${sub})`);
      return await this.userRepository.findOne({ where: { id: sub } });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to find user by ID! [PostgreSQL]',
        error.message,
      );
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      console.log(
        `[UserRepository] Request to PostgreSQL: findByUsername(${username})`,
      );
      return await this.userRepository.findOne({
        where: { username: username },
      });
    } catch (err) {
      throw new NotFoundException('User not found!', err.message);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      console.log(
        `[UserRepository] Request to PostgreSQL: findByEmail(${email})`,
      );
      return await this.userRepository.findOne({ where: { email: email } });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to find user SQL',
        error.message,
      );
    }
  }

  async create(userData: Partial<User>): Promise<User> {
    try {
      console.log(
        `[UserRepository] Request to PostgreSQL: create user with email: ${userData.email}`,
      );
      const newUser = this.userRepository.create(userData);
      return this.userRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create new user:',
        error.message,
      );
    }
  }

  async update(id: string, partialUser: Partial<User>): Promise<User | null> {
    console.log(
      `[UserRepository] Request to PostgreSQL: update user with id: ${id}`,
    );
    const user = await this.userRepository.preload({ id, ...partialUser });

    if (!user) return null;

    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<boolean> {
    console.log(
      `[UserRepository] Request to PostgreSQL: delete user with id: ${id}`,
    );
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
