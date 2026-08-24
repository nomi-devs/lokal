import { AppConfig } from './app-config.type';
import { AuthConfig } from '../auth/config/auth-config.type';
import { DatabaseConfig } from '../database/config/database-config.type';
import { FileConfig } from '../files/config/file-config.type';
import { SmsConfig } from '../sms/config/sms-config.type';
import { EmailConfig } from '../email/config/email-config.type';
import { CartConfig } from '../cart/config/cart-config.type';
import { MyFatoorahConfig } from '../payments/config/myfatoorah-config.type';
import { PushConfig } from '../push/config/push-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  file: FileConfig;
  sms: SmsConfig;
  email: EmailConfig;
  cart: CartConfig;
  myfatoorah: MyFatoorahConfig;
  push: PushConfig;
};
