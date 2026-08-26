import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { findOrThrow } from '../common/utils/find-or-throw.util';
import { Setting } from './domain/setting';
import { SettingRepository } from './infrastructure/persistence/setting.repository';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { UpdateSupportSettingsDto } from './dto/update-support-settings.dto';

// Keys settings-seed.service.ts creates under category "support" — see
// SettingsService.updateSupport and SupportInformationCard.tsx (dashboard).
const SUPPORT_SETTING_KEYS = [
  'supportEmail',
  'supportPhone',
  'whatsappNumber',
  'websiteUrl',
  'officeAddress',
] as const;

@Injectable()
export class SettingsService {
  constructor(private readonly settingRepository: SettingRepository) {}

  list(): Promise<Setting[]> {
    return this.settingRepository.findAll();
  }

  async create(dto: CreateSettingDto): Promise<Setting> {
    const existing = await this.settingRepository.findByKey(dto.key);
    if (existing) {
      throw new AppException(
        ERROR_CODES.SETTING_KEY_EXISTS,
        'Setting key already exists',
        409,
      );
    }
    this.assertValueMatchesType(dto.value, dto.type);

    return this.settingRepository.create({
      key: dto.key,
      value: dto.value,
      type: dto.type,
      category: dto.category,
      descriptionEn: dto.descriptionEn,
      descriptionAr: dto.descriptionAr,
    });
  }

  async update(
    adminId: string,
    key: string,
    dto: UpdateSettingDto,
  ): Promise<Setting> {
    const existing = await this.getOrThrow(key);
    this.assertValueMatchesType(dto.value, existing.type);

    const updated = await this.settingRepository.update(key, {
      value: dto.value,
      updatedBy: adminId,
    });
    return updated as Setting;
  }

  // Backs the dashboard's single "Support Information" form — one request
  // in, one or more of the 5 support-category rows updated, the updated
  // rows returned so the client can merge them back into its settings list
  // without a second GET. Reuses update() per key (same type-check/
  // updatedBy bookkeeping as the generic single-key PATCH), just sequenced
  // behind one call instead of the client firing one PATCH per field.
  async updateSupport(
    adminId: string,
    dto: UpdateSupportSettingsDto,
  ): Promise<Setting[]> {
    const entries = SUPPORT_SETTING_KEYS.filter(
      (key) => dto[key] !== undefined,
    ).map((key) => [key, dto[key] as string] as const);

    return Promise.all(
      entries.map(([key, value]) => this.update(adminId, key, { value })),
    );
  }

  async remove(key: string): Promise<void> {
    await this.getOrThrow(key);
    await this.settingRepository.remove(key);
  }

  private assertValueMatchesType(
    value: string | number | boolean,
    type: Setting['type'],
  ): void {
    // 'json' settings store raw JSON text, so they're backed by a string
    // value the same as 'string' settings.
    const expected = type === 'json' ? 'string' : type;
    if (typeof value !== expected) {
      throw new AppException(
        ERROR_CODES.VALIDATION_ERROR,
        `value must be a ${type}`,
        422,
        [{ field: 'value', message: `must be a ${type}` }],
      );
    }
  }

  private getOrThrow(key: string): Promise<Setting> {
    return findOrThrow(
      this.settingRepository.findByKey(key),
      ERROR_CODES.SETTING_NOT_FOUND,
      'Setting not found',
    );
  }
}
