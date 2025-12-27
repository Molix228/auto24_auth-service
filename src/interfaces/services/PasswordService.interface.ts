import { PasswordHashResult } from 'src/types';

export interface IPasswordService {
  /**
   * Password Hashing with salt generation
   * @param password — open source password
   * @returns Object with password hash and salt
   */
  hash(password: string): Promise<PasswordHashResult>;
  /**
   * Compare password with hash
   * @param password — open source password
   * @param hash — hash for comparison
   * @returns boolean value
   */
  compare(password: string, hash: string): Promise<boolean>;
}
