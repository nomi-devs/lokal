import { Module } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { AdminPromoCodesController } from './admin-promo-codes.controller';
import { DocumentPromoCodePersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [DocumentPromoCodePersistenceModule],
  controllers: [AdminPromoCodesController],
  providers: [PromoCodesService],
  exports: [PromoCodesService],
})
export class PromoCodesModule {}
