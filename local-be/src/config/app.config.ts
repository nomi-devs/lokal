import { registerAs } from '@nestjs/config';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import validateConfig from '../utils/validate-config';
import { AppConfig } from './app-config.type';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT: number;

  @IsOptional()
  CORS_ORIGINS: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    // Dashboard dev server defaults to :5173 (Vite) — add more via a
    // comma-separated CORS_ORIGINS env var as other clients come online.
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
});
