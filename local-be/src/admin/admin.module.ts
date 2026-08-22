import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { VendorsModule } from '../vendors/vendors.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminVendorsController } from './admin-vendors.controller';
import { AdminDashboardController } from './admin-dashboard.controller';

@Module({
  imports: [UsersModule, VendorsModule],
  controllers: [
    AdminUsersController,
    AdminVendorsController,
    AdminDashboardController,
  ],
})
export class AdminModule {}
