import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateUserProfile } from 'src/dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.exists')
  async checkUserExists(@Payload() username: string) {
    return await this.userService.checkExistingUser(username);
  }

  @MessagePattern('user.get-profile')
  async handleGetProfile(@Payload() id: string) {
    return await this.userService.getUserProfile(id);
  }

  @MessagePattern('user.deletebyid')
  async handleDeleteUser(@Payload() id: string) {
    return await this.userService.deleteUser(id);
  }

  @MessagePattern('user.update-profile')
  async handleUpdateProfile(@Payload() updateUserDto: UpdateUserProfile) {
    const { id, ...dataToUpdate } = updateUserDto;
    return await this.userService.updateProfile(id, dataToUpdate);
  }
}
