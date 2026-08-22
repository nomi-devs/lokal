import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpSchema, OtpSchemaClass } from './entities/otp.schema';
import { OtpRepository } from '../otp.repository';
import { OtpDocumentRepository } from './repositories/otp.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OtpSchemaClass.name, schema: OtpSchema },
    ]),
  ],
  providers: [{ provide: OtpRepository, useClass: OtpDocumentRepository }],
  exports: [OtpRepository],
})
export class DocumentOtpPersistenceModule {}
