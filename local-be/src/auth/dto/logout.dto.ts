import { IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  // Omit to revoke every session for this user; pass to log out just this device.
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsString()
  fcmToken?: string;
}
