import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { EmailConfig } from './email-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  EMAIL_HOST: string;

  @IsString()
  @IsOptional()
  EMAIL_PORT: string;

  @IsString()
  @IsOptional()
  EMAIL_USER: string;

  @IsString()
  @IsOptional()
  EMAIL_PASSWORD: string;

  @IsString()
  @IsOptional()
  EMAIL_FROM: string;
}

// SMTP delivery is best-effort (see email.service.ts) — every field here is
// optional so local dev works without real credentials configured.
export default registerAs<EmailConfig>('email', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT
      ? parseInt(process.env.EMAIL_PORT, 10)
      : undefined,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  };
});
