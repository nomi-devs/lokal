import { Module } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { AdminRefundsController } from './admin-refunds.controller';
import { DocumentRefundPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DocumentRefundPersistenceModule, OrdersModule, UsersModule],
  controllers: [RefundsController, AdminRefundsController],
  providers: [RefundsService],
  exports: [RefundsService],
})
export class RefundsModule {}
