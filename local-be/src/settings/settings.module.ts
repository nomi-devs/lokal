import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AdminSettingsController } from './admin-settings.controller';
import { DocumentSettingPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [DocumentSettingPersistenceModule],
  controllers: [AdminSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
