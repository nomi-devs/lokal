import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { Setting } from './domain/setting';
import { SettingRepository } from './infrastructure/persistence/setting.repository';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

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

  private async getOrThrow(key: string): Promise<Setting> {
    const setting = await this.settingRepository.findByKey(key);
    if (!setting) {
      throw new AppException(
        ERROR_CODES.SETTING_NOT_FOUND,
        'Setting not found',
        404,
      );
    }
    return setting;
  }
}
