import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorSchema, VendorSchemaClass } from './entities/vendor.schema';
import { VendorRepository } from '../vendor.repository';
import { VendorsDocumentRepository } from './repositories/vendor.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VendorSchemaClass.name, schema: VendorSchema },
    ]),
  ],
  providers: [
    { provide: VendorRepository, useClass: VendorsDocumentRepository },
  ],
  exports: [VendorRepository],
})
export class DocumentVendorPersistenceModule {}
