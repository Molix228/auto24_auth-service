import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateUserProfile {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
