import { UpdateUserProfile } from 'src/dto/update-user.dto';
import { SafeUser } from 'src/types/responses/safe-user.interface';

export interface IUserService {
  /**
   * Checking for existence of user profile
   * @param username — name for validation
   * @throws ConflictException – if user not exists
   */
  checkExistingUser(username: string): Promise<void>;
  /**
   * Get profile of existing user
   * @param id — User ID
   * @returns Safe User Data (without password)
   * @throws NotFoundException — if user not found
   */
  getUserProfile(id: string): Promise<SafeUser>;
  /**
   * Update User Profile
   * @param id — User ID
   * @param dataToUpdate — Some data to update existing user
   * @returns Updated user info
   * @throws NotFoundException – if user not found
   */
  updateProfile(
    id: string,
    dataToUpdate: Partial<UpdateUserProfile>,
  ): Promise<SafeUser>;

  /**
   * Deleting of user
   * @param id — User ID
   * @returns true – if deletion successed
   * @throws NotFoundException — if user not found
   * @throws InternalServerErrorException — error while deleting
   */
  deleteUser(id: string): Promise<boolean>;
}
