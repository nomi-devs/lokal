import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { DocumentAddressPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [DocumentAddressPersistenceModule],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
