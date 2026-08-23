import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class DashboardResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'otp must contain only digits' })
  otp: string;

  @IsString()
  @Length(8, 128)
  newPassword: string;
}
