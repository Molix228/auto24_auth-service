import { User } from 'src/entities/user.entity';
import { TokenPair, TokenPayload } from 'src/types';

export interface ITokenService {
  /**
   * Access token generation
   * @param payload — token data
   * @returns JWt access token
   */
  generateAccessToken(payload: TokenPayload): Promise<string>;
  /**
   * Refresh token generation
   * @param payload — token data
   * @returns JWT refresh token
   */
  generateRefreshToken(payload: TokenPayload): Promise<string>;
  /**
   * Tokens pair generation
   * @param user — target user for token pair generation
   * @returns Object that includes access and refresh tokens
   */
  generateTokenPair(user: User): Promise<TokenPair>;
}
