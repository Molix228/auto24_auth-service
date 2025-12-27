import { Controller, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateUserProfile } from 'src/dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @MessagePattern('auth.login')
  async login(@Payload() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }

  @MessagePattern('auth.validate-token')
  async handleValidateToken(@Payload() token: string) {
    return await this.authService.validateToken(token);
  }

  @MessagePattern('auth.validate-refresh-token')
  async handleValidateRefreshToken(@Payload() token: string) {
    return await this.authService.validateRefreshToken(token);
  }

  @MessagePattern('auth.refresh-access-token')
  async handleRefreshAccessToken(@Payload() id: string) {
    return await this.authService.refreshAccessToken(id);
  }
}
