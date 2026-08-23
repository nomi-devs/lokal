import { IsEmail, IsString, Length, Matches } from 'class-validator';

// Middle step of dashboard password reset — confirms the OTP without
// consuming it. See DashboardResetPasswordDto for the final step.
export class DashboardVerifyResetOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'otp must contain only digits' })
  otp: string;
}
