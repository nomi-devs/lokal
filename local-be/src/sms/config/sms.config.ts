import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { SmsConfig } from './sms-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  SMS_BASE_URL: string;

  @IsString()
  @IsOptional()
  SMS_USERNAME: string;

  @IsString()
  @IsOptional()
  SMS_PASSWORD: string;

  @IsString()
  @IsOptional()
  SMS_CUSTOMERID: string;

  @IsString()
  @IsOptional()
  SMS_SENDER: string;
}

// SMSBox delivery is best-effort (see sms.service.ts) — every field here is
// optional so local dev works without real credentials configured.
export default registerAs<SmsConfig>('sms', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    baseUrl: process.env.SMS_BASE_URL,
    username: process.env.SMS_USERNAME,
    password: process.env.SMS_PASSWORD,
    customerId: process.env.SMS_CUSTOMERID,
    sender: process.env.SMS_SENDER,
  };
});
