import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { AllConfigType } from '../../../../config/config.type';
import { FileRepository } from '../../persistence/file.repository';

export interface UploadUrlResult {
  fileId: string;
  uploadUrl: string;
  fileUrl: string;
  expiresIn: number;
}

@Injectable()
export class FilesS3PresignedService {
  private readonly s3: S3Client;

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.s3 = new S3Client({
      region: this.configService.get('file.awsS3Region', { infer: true }),
      credentials: {
        accessKeyId: this.configService.getOrThrow('file.accessKeyId', {
          infer: true,
        }),
        secretAccessKey: this.configService.getOrThrow('file.secretAccessKey', {
          infer: true,
        }),
      },
    });
  }

  async createUploadUrl(
    fileName: string,
    contentType: string,
    purpose: string | undefined,
    uploadedBy: string,
  ): Promise<UploadUrlResult> {
    const bucket = this.configService.getOrThrow('file.awsDefaultS3Bucket', {
      infer: true,
    });
    const region = this.configService.get('file.awsS3Region', { infer: true });
    const prefix = this.configService.getOrThrow('file.uploadPrefix', {
      infer: true,
    });
    const expiresIn = this.configService.getOrThrow(
      'file.signedUrlExpiration',
      { infer: true },
    );

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = [prefix, purpose ?? 'misc', `${uuid()}-${sanitizedName}`]
      .filter(Boolean)
      .join('/');

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn });
    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    const record = await this.fileRepository.create({
      key,
      url: fileUrl,
      contentType,
      purpose,
      uploadedBy,
    });

    return { fileId: record.id, uploadUrl, fileUrl, expiresIn };
  }
}
