import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RefundSchema, RefundSchemaClass } from './entities/refund.schema';
import { RefundRepository } from '../refund.repository';
import { RefundsDocumentRepository } from './repositories/refund.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefundSchemaClass.name, schema: RefundSchema },
    ]),
  ],
  providers: [
    { provide: RefundRepository, useClass: RefundsDocumentRepository },
  ],
  exports: [RefundRepository],
})
export class DocumentRefundPersistenceModule {}
