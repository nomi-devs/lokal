import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../../../../users/users.module';
import { AdminSeedService } from './admin-seed.service';
import adminSeedConfig from './admin-seed.config';

@Module({
  imports: [ConfigModule.forFeature(adminSeedConfig), UsersModule],
  providers: [AdminSeedService],
  exports: [AdminSeedService],
})
export class AdminSeedModule {}
