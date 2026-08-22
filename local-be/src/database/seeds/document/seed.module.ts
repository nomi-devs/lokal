import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import databaseConfig from '../../config/database.config';
import authConfig from '../../../auth/config/auth.config';
import { AllConfigType } from '../../../config/config.type';
import { AdminSeedModule } from './admin/admin-seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        uri: configService.getOrThrow('database.uri', { infer: true }),
      }),
    }),
    AdminSeedModule,
  ],
})
export class SeedModule {}
