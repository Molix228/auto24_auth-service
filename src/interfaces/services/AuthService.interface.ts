import { CreateUserDto } from 'src/dto/create-user.dto';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { User } from 'src/entities/user.entity';
import { LoginResponse } from '../../types/responses/login-response.interface';
import { TokenValidationResult } from 'src/types';

export interface IAuthService {
  /**
   *
   * @param createUserDto — user data for registration
   * @returns Partial User data
   * @throws ConflictException — if user not exists
   * @throws InternalServerErrorException — if occurs error while creating
   */
  register(createUserDto: CreateUserDto): Promise<Partial<User>>;
  /**
   *
   * @param loginUserDto — user data for login
   * @returns Access and Reafresh tokens + Safe user data
   * @throws UnauthorizedException — when invalid credentials
   */
  login(loginUserDto: LoginUserDto): Promise<LoginResponse>;
  /**
   *
   * @param token — JWT token for validation
   * @returns Validation result with user claims
   */
  validateToken(token: string): Promise<TokenValidationResult>;
  /**
   *
   * @param token — refresh token for validation
   * @returns Validation result with user claims
   */
  validateRefreshToken(token: string): Promise<TokenValidationResult>;
  /**
   *
   * @param userId — User ID
   * @returns New AccessToken
   * @throws UnauthorizedException - if user not found
   */
  refreshAccessToken(userId: string): Promise<string>;
}
