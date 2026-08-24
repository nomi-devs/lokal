import { Types } from 'mongoose';
import {
  Setting,
  SettingCategory,
  SettingType,
} from '../../../../domain/setting';
import { SettingSchemaClass } from '../entities/setting.schema';

export class SettingMapper {
  static toDomain(raw: SettingSchemaClass): Setting {
    const entity = new Setting();
    entity.id = raw._id;
    entity.key = raw.key;
    entity.value = raw.value;
    entity.type = raw.type as SettingType;
    entity.category = raw.category as SettingCategory;
    entity.descriptionEn = raw.descriptionEn;
    entity.descriptionAr = raw.descriptionAr;
    entity.updatedBy = raw.updatedBy?.toString();
    entity.createdAt = raw.createdAt as Date;
    entity.updatedAt = raw.updatedAt as Date;
    return entity;
  }

  static toPersistence(domain: Partial<Setting>): Partial<SettingSchemaClass> {
    const doc: Partial<SettingSchemaClass> = {};
    if (domain.key !== undefined) doc.key = domain.key;
    if (domain.value !== undefined) doc.value = domain.value;
    if (domain.type !== undefined) doc.type = domain.type;
    if (domain.category !== undefined) doc.category = domain.category;
    if (domain.descriptionEn !== undefined)
      doc.descriptionEn = domain.descriptionEn;
    if (domain.descriptionAr !== undefined)
      doc.descriptionAr = domain.descriptionAr;
    if (domain.updatedBy !== undefined)
      doc.updatedBy = new Types.ObjectId(domain.updatedBy);
    return doc;
  }
}
