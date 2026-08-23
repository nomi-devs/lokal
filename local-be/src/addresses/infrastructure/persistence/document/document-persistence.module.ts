import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressSchema, AddressSchemaClass } from './entities/address.schema';
import { AddressRepository } from '../address.repository';
import { AddressesDocumentRepository } from './repositories/address.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AddressSchemaClass.name, schema: AddressSchema },
    ]),
  ],
  providers: [
    { provide: AddressRepository, useClass: AddressesDocumentRepository },
  ],
  exports: [AddressRepository],
})
export class DocumentAddressPersistenceModule {}
