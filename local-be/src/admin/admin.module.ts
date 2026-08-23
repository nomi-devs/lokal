import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { VendorsModule } from '../vendors/vendors.module';
import { ProductsModule } from '../products/products.module';
import { WishlistsModule } from '../wishlists/wishlists.module';
import { AddressesModule } from '../addresses/addresses.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminVendorsController } from './admin-vendors.controller';
import { AdminDashboardController } from './admin-dashboard.controller';

@Module({
  imports: [
    UsersModule,
    VendorsModule,
    ProductsModule,
    WishlistsModule,
    AddressesModule,
  ],
  controllers: [
    AdminUsersController,
    AdminVendorsController,
    AdminDashboardController,
  ],
})
export class AdminModule {}
