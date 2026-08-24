import { Module } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { FaqController } from './faqs.controller';
import { AdminFaqController } from './admin-faq.controller';
import { DocumentFaqPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [DocumentFaqPersistenceModule],
  controllers: [FaqController, AdminFaqController],
  providers: [FaqsService],
  exports: [FaqsService],
})
export class FaqsModule {}
