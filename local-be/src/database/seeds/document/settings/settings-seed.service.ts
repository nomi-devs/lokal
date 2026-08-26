import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../../../settings/settings.service';

interface DefaultSupportSetting {
  key: string;
  descriptionEn: string;
  descriptionAr: string;
}

// Seeded with empty values — an admin fills in the real contact details via
// the dashboard's Settings > Support tab (PATCH /admin/settings/:key), same
// as seed:admin creates a blank-slate account rather than fake data.
const DEFAULT_SUPPORT_SETTINGS: DefaultSupportSetting[] = [
  {
    key: 'supportEmail',
    descriptionEn: 'Primary email for user inquiries',
    descriptionAr: 'البريد الإلكتروني الأساسي لاستفسارات المستخدمين',
  },
  {
    key: 'supportPhone',
    descriptionEn: 'Customer support phone line',
    descriptionAr: 'خط هاتف دعم العملاء',
  },
  {
    key: 'whatsappNumber',
    descriptionEn: 'WhatsApp contact for quick messaging',
    descriptionAr: 'رقم واتساب للتواصل السريع',
  },
  {
    key: 'websiteUrl',
    descriptionEn: 'Main website or help center URL',
    descriptionAr: 'رابط الموقع الإلكتروني أو مركز المساعدة',
  },
  {
    key: 'officeAddress',
    descriptionEn: 'Physical office address for support',
    descriptionAr: 'العنوان الفعلي لمكتب الدعم',
  },
];

@Injectable()
export class SettingsSeedService {
  private readonly logger = new Logger(SettingsSeedService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async run(): Promise<void> {
    const existingKeys = new Set(
      (await this.settingsService.list()).map((setting) => setting.key),
    );

    for (const setting of DEFAULT_SUPPORT_SETTINGS) {
      if (existingKeys.has(setting.key)) {
        continue;
      }

      await this.settingsService.create({
        key: setting.key,
        value: '',
        type: 'string',
        category: 'support',
        descriptionEn: setting.descriptionEn,
        descriptionAr: setting.descriptionAr,
      });
      this.logger.log(`Created default support setting: ${setting.key}`);
    }
  }
}
