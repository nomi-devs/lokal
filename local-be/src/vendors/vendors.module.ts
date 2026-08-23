import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { DocumentVendorPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { UsersModule } from '../users/users.module';
import { FilesS3PresignedModule } from '../files/infrastructure/uploader/s3-presigned/files.module';
import { OtpModule } from '../otp/otp.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    DocumentVendorPersistenceModule,
    UsersModule,
    FilesS3PresignedModule,
    OtpModule,
    EmailModule,
  ],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService, DocumentVendorPersistenceModule],
})
export class VendorsModule {}
