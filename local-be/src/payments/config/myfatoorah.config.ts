import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { MyFatoorahConfig } from './myfatoorah-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  MYFATOORAH_TOKEN: string;

  @IsString()
  @IsOptional()
  MYFATOORAH_BASE_URL: string;

  @IsString()
  @IsOptional()
  MYFATOORAH_CURRENCY: string;

  @IsString()
  @IsOptional()
  MYFATOORAH_COUNTRY_CODE: string;
}

// Optional at boot (like sms/email) so the app still starts without a
// gateway account configured — PaymentsService throws a clear
// PAYMENT_GATEWAY_ERROR the moment checkout is actually attempted without
// these set, rather than failing silently or crashing startup.
export default registerAs<MyFatoorahConfig>('myfatoorah', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    token: process.env.MYFATOORAH_TOKEN,
    baseUrl: process.env.MYFATOORAH_BASE_URL,
    currency: process.env.MYFATOORAH_CURRENCY || 'KWD',
    countryCode: process.env.MYFATOORAH_COUNTRY_CODE || '+965',
  };
});
