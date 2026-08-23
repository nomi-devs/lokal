import { IsEmail } from 'class-validator';

// Dashboard (vendor/admin) equivalent of MobileAuthService's phone+SMS
// forgot-password — this one is email+SMTP, since the dashboard login form
// collects email rather than phone.
export class DashboardForgotPasswordDto {
  @IsEmail()
  email: string;
}
