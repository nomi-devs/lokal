import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { Setting } from '../../../../domain/setting';
import { SettingRepository } from '../../setting.repository';
import {
  SettingSchemaClass,
  SettingSchemaDocument,
} from '../entities/setting.schema';
import { SettingMapper } from '../mappers/setting.mapper';

@Injectable()
export class SettingsDocumentRepository implements SettingRepository {
  constructor(
    @InjectModel(SettingSchemaClass.name)
    private readonly settingModel: Model<SettingSchemaDocument>,
  ) {}

  async create(
    data: Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Setting> {
    const created = await this.settingModel.create(
      SettingMapper.toPersistence(data),
    );
    return SettingMapper.toDomain(created);
  }

  async findAll(): Promise<Setting[]> {
    const found = await this.settingModel.find().sort({ category: 1, key: 1 });
    return found.map((s) => SettingMapper.toDomain(s));
  }

  async findByKey(key: string): Promise<NullableType<Setting>> {
    const found = await this.settingModel.findOne({ key });
    return found ? SettingMapper.toDomain(found) : null;
  }

  async update(
    key: string,
    payload: DeepPartial<Setting>,
  ): Promise<NullableType<Setting>> {
    const updated = await this.settingModel.findOneAndUpdate(
      { key },
      SettingMapper.toPersistence(payload as Partial<Setting>),
      { new: true },
    );
    return updated ? SettingMapper.toDomain(updated) : null;
  }

  async remove(key: string): Promise<void> {
    await this.settingModel.deleteOne({ key });
  }
}
