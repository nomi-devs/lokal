import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../../../utils/validate-config';
import { AdminSeedConfig } from './admin-seed-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  ADMIN_PHONE: string;

  @IsString()
  ADMIN_PASSWORD: string;

  @IsString()
  @IsOptional()
  ADMIN_EMAIL: string;

  @IsString()
  @IsOptional()
  ADMIN_FIRST_NAME: string;

  @IsString()
  @IsOptional()
  ADMIN_LAST_NAME: string;
}

export default registerAs<AdminSeedConfig>('adminSeed', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    phone: process.env.ADMIN_PHONE as string,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD as string,
    firstName: process.env.ADMIN_FIRST_NAME || 'Super',
    lastName: process.env.ADMIN_LAST_NAME || 'Admin',
  };
});
