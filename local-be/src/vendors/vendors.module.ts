import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { DocumentVendorPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DocumentVendorPersistenceModule, UsersModule],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService, DocumentVendorPersistenceModule],
})
export class VendorsModule {}
