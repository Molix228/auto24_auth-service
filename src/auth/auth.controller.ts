import { Controller, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateUserProfile } from 'src/dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('user.exists')
  async checkUserExists(@Payload() username: string) {
    return await this.authService.checkExistingUser(username);
  }

  @MessagePattern('user.register')
  async register(@Payload() createUserDto: CreateUserDto) {
    Logger.debug(`[user.register] Received final payload:`, createUserDto);
    Logger.debug(
      `[user.register] Type of final payload: ${typeof createUserDto}`,
    );
    Logger.debug(
      `[user.register] Payload instanceof CreateUserDto: ${createUserDto instanceof CreateUserDto}`,
    );
    return await this.authService.register(createUserDto);
  }

  @MessagePattern('user.login')
  async login(@Payload() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }

  @MessagePattern('auth.validate-token')
  async handleValidateToken(@Payload() token: string) {
    return await this.authService.validateToken(token);
  }

  @MessagePattern('user.get-profile')
  async handleGetProfile(@Payload() id: string) {
    return await this.authService.getUserProfile(id);
  }

  @MessagePattern('user.deletebyid')
  async handleDeleteUser(@Payload() id: string) {
    return await this.authService.deleteUser(id);
  }

  @MessagePattern('user.update-profile')
  async handleUpdateProfile(@Payload() updateUserDto: UpdateUserProfile) {
    const { id, ...dataToUpdate } = updateUserDto;
    return await this.authService.updateProfile(id, dataToUpdate);
  }
}
