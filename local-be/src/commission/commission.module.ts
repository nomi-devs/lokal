import { Module } from '@nestjs/common';
import { DocumentCommissionPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';

@Module({
  imports: [DocumentCommissionPersistenceModule],
  controllers: [CommissionController],
  providers: [CommissionService],
  exports: [CommissionService],
})
export class CommissionModule {}
