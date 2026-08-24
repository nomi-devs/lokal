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

  @IsOptional()
  API_BASE_URL: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port,
    // Dashboard dev server defaults to :5173 (Vite) — add more via a
    // comma-separated CORS_ORIGINS env var as other clients come online.
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    // Must be a publicly-reachable URL in any environment where MyFatoorah
    // needs to redirect back to us (see payments/config/myfatoorah.config.ts)
    // — the localhost default only works for local-only smoke testing.
    baseUrl: process.env.API_BASE_URL || `http://localhost:${port}`,
  };
});
