import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { StoresController } from './stores.controller';
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
  // VendorsController first: its literal GET 'me' route must be registered
  // before StoresController's GET ':id', or the param route would swallow
  // /vendors/me (Nest/Express match routes in registration order).
  controllers: [VendorsController, StoresController],
  providers: [VendorsService],
  exports: [VendorsService, DocumentVendorPersistenceModule],
})
export class VendorsModule {}
