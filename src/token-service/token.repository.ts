import { InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ms, { StringValue } from 'ms';
import { RefreshToken } from 'src/entities/token.entity';
import { Repository } from 'typeorm';

export class TokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly tokenRepository: Repository<RefreshToken>,
  ) {}

  async createToken(
    userId: string,
    token: string,
    expiresIn: string,
  ): Promise<RefreshToken> {
    try {
      console.log(
        `[TokenRepository] Request to PostgreSQL: createToken for userId ${userId}`,
      );
      const milliseconds = ms(expiresIn as StringValue);

      if (typeof milliseconds !== 'number') {
        throw new Error(`Invalid expiresIn format: ${expiresIn}`);
      }

      const expiresAt = new Date(Date.now() + milliseconds);

      const newToken = this.tokenRepository.create({
        userId,
        token,
        expiresAt,
        isRevoked: false,
      });

      return await this.tokenRepository.save(newToken);
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Failed to save refreshToken to PostgreSQL',
        error.message,
      );
    }
  }

  async findActiveToken(token: string): Promise<RefreshToken | null> {
    try {
      return await this.tokenRepository.findOne({
        where: { token, isRevoked: false },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error finding active token',
        error.message,
      );
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      console.log(`[TokenRepository] Revoking all user ${userId} tokens`);
      await this.tokenRepository.update(
        { userId: userId, isRevoked: false },
        { isRevoked: true },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to revoke tokens',
        error.message,
      );
    }
  }

  async revokeToken(token: string): Promise<void> {
    try {
      console.log('[TokenRepository] Revoking single token');
      await this.tokenRepository.update({ token }, { isRevoked: true });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to revoke token in PostgreSQL',
        error.message,
      );
    }
  }

  async update(
    id: string,
    partialToken: Partial<RefreshToken>,
  ): Promise<RefreshToken | null> {
    try {
      const token = await this.tokenRepository.preload({ id, ...partialToken });
      if (!token) return null;
      return await this.tokenRepository.save(token);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update token',
        error.message,
      );
    }
  }
}
