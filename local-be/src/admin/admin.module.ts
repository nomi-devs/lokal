import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { VendorsModule } from '../vendors/vendors.module';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { WishlistsModule } from '../wishlists/wishlists.module';
import { AddressesModule } from '../addresses/addresses.module';
import { OrdersModule } from '../orders/orders.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminVendorsController } from './admin-vendors.controller';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminProductsController } from './admin-products.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminPaymentsController } from './admin-payments.controller';

@Module({
  imports: [
    UsersModule,
    VendorsModule,
    ProductsModule,
    CategoriesModule,
    WishlistsModule,
    AddressesModule,
    OrdersModule,
  ],
  controllers: [
    AdminUsersController,
    AdminVendorsController,
    AdminCategoriesController,
    AdminProductsController,
    AdminDashboardController,
    AdminOrdersController,
    AdminPaymentsController,
  ],
})
export class AdminModule {}
