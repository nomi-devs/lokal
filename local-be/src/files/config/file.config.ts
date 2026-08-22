import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { FileConfig } from './file-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  @IsOptional()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsOptional()
  AWS_REGION: string;

  @IsString()
  @IsOptional()
  S3_BUCKET_NAME: string;

  @IsString()
  @IsOptional()
  S3_UPLOAD_PREFIX: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  S3_SIGNED_URL_EXPIRATION: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  S3_MAX_UPLOAD_BYTES: number;
}

export default registerAs<FileConfig>('file', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsS3Region: process.env.AWS_REGION,
    awsDefaultS3Bucket: process.env.S3_BUCKET_NAME,
    uploadPrefix: process.env.S3_UPLOAD_PREFIX || '',
    signedUrlExpiration: process.env.S3_SIGNED_URL_EXPIRATION
      ? parseInt(process.env.S3_SIGNED_URL_EXPIRATION, 10)
      : 600,
    maxUploadBytes: process.env.S3_MAX_UPLOAD_BYTES
      ? parseInt(process.env.S3_MAX_UPLOAD_BYTES, 10)
      : 5 * 1024 * 1024,
  };
});
