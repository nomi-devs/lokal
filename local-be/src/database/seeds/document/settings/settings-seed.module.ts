import { Module } from '@nestjs/common';
import { SettingsModule } from '../../../../settings/settings.module';
import { SettingsSeedService } from './settings-seed.service';

@Module({
  imports: [SettingsModule],
  providers: [SettingsSeedService],
  exports: [SettingsSeedService],
})
export class SettingsSeedModule {}
