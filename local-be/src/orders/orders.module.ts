import { Module } from '@nestjs/common';
import { DocumentOrdersPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { CartModule } from '../cart/cart.module';
import { AddressesModule } from '../addresses/addresses.module';
import { ProductsModule } from '../products/products.module';
import { VendorsModule } from '../vendors/vendors.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommissionModule } from '../commission/commission.module';
import { OrdersService } from './orders.service';
import { CheckoutController } from './checkout.controller';
import { OrdersController } from './orders.controller';
import { VendorOrdersController } from './vendor-orders.controller';
import { PaymentCallbackController } from './payment-callback.controller';

@Module({
  imports: [
    DocumentOrdersPersistenceModule,
    CartModule,
    AddressesModule,
    ProductsModule,
    VendorsModule,
    UsersModule,
    EmailModule,
    PaymentsModule,
    NotificationsModule,
    CommissionModule,
  ],
  controllers: [
    CheckoutController,
    OrdersController,
    VendorOrdersController,
    PaymentCallbackController,
  ],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
