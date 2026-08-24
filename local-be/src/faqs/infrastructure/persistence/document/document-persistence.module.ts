import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqSchema, FaqSchemaClass } from './entities/faq.schema';
import { FaqRepository } from '../faq.repository';
import { FaqsDocumentRepository } from './repositories/faq.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FaqSchemaClass.name, schema: FaqSchema },
    ]),
  ],
  providers: [{ provide: FaqRepository, useClass: FaqsDocumentRepository }],
  exports: [FaqRepository],
})
export class DocumentFaqPersistenceModule {}
