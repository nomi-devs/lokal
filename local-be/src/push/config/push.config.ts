import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { PushConfig } from './push-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  @IsOptional()
  FIREBASE_CLIENT_EMAIL: string;

  @IsString()
  @IsOptional()
  FIREBASE_PRIVATE_KEY: string;
}

// FCM delivery is best-effort (see push.service.ts) — every field here is
// optional so local dev works without real Firebase credentials configured.
export default registerAs<PushConfig>('push', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The env var stores literal "\n" sequences (can't hold real newlines in
    // most .env formats) — swap them back before handing the key to the SDK.
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
});
