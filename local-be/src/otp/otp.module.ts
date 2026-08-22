import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { DocumentOtpPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [DocumentOtpPersistenceModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
