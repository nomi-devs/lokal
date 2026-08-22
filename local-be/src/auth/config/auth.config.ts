import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import ms from 'ms';
import validateConfig from '../../utils/validate-config';
import {
  BCRYPT_ROUNDS_DEFAULT,
  JWT_ACCESS_EXPIRES_IN_DEFAULT,
  JWT_REFRESH_EXPIRES_IN_DEFAULT,
  MAX_ACTIVE_SESSIONS_DEFAULT,
  OTP_EXPIRY_MINUTES_DEFAULT,
  OTP_LENGTH_DEFAULT,
  OTP_MAX_ATTEMPTS_DEFAULT,
  OTP_MAX_REQUESTS_PER_HOUR_DEFAULT,
} from '../../common/constants/auth.constants';
import { AuthConfig } from './auth-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN: string;

  @IsInt()
  @Min(4)
  @Max(8)
  @IsOptional()
  OTP_LENGTH: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  OTP_EXPIRY_MINUTES: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  OTP_MAX_ATTEMPTS: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  OTP_MAX_REQUESTS_PER_HOUR: number;

  @IsInt()
  @Min(4)
  @IsOptional()
  BCRYPT_ROUNDS: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  MAX_ACTIVE_SESSIONS: number;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  const jwtAccessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ||
    JWT_ACCESS_EXPIRES_IN_DEFAULT) as ms.StringValue;
  const jwtRefreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ||
    JWT_REFRESH_EXPIRES_IN_DEFAULT) as ms.StringValue;

  return {
    jwtSecret: process.env.JWT_SECRET as string,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
    jwtAccessExpiresIn,
    jwtRefreshExpiresIn,
    jwtAccessExpirySeconds: Math.floor(ms(jwtAccessExpiresIn) / 1000),
    jwtRefreshExpirySeconds: Math.floor(ms(jwtRefreshExpiresIn) / 1000),
    otpLength: process.env.OTP_LENGTH
      ? parseInt(process.env.OTP_LENGTH, 10)
      : OTP_LENGTH_DEFAULT,
    otpExpiryMinutes: process.env.OTP_EXPIRY_MINUTES
      ? parseInt(process.env.OTP_EXPIRY_MINUTES, 10)
      : OTP_EXPIRY_MINUTES_DEFAULT,
    otpMaxAttempts: process.env.OTP_MAX_ATTEMPTS
      ? parseInt(process.env.OTP_MAX_ATTEMPTS, 10)
      : OTP_MAX_ATTEMPTS_DEFAULT,
    otpMaxRequestsPerHour: process.env.OTP_MAX_REQUESTS_PER_HOUR
      ? parseInt(process.env.OTP_MAX_REQUESTS_PER_HOUR, 10)
      : OTP_MAX_REQUESTS_PER_HOUR_DEFAULT,
    bcryptRounds: process.env.BCRYPT_ROUNDS
      ? parseInt(process.env.BCRYPT_ROUNDS, 10)
      : BCRYPT_ROUNDS_DEFAULT,
    maxActiveSessions: process.env.MAX_ACTIVE_SESSIONS
      ? parseInt(process.env.MAX_ACTIVE_SESSIONS, 10)
      : MAX_ACTIVE_SESSIONS_DEFAULT,
  };
});
