import { Banner } from '../../../../domain/banner';
import { BannerSchemaClass } from '../entities/banner.schema';

export class BannerMapper {
  static toDomain(raw: BannerSchemaClass): Banner {
    const entity = new Banner();
    entity.id = raw._id;
    entity.imageUrl = raw.imageUrl;
    entity.titleEn = raw.titleEn;
    entity.titleAr = raw.titleAr;
    entity.linkUrl = raw.linkUrl;
    entity.sortOrder = raw.sortOrder ?? 0;
    entity.isActive = raw.isActive;
    entity.startDate = raw.startDate;
    entity.endDate = raw.endDate;
    entity.createdAt = raw.createdAt as Date;
    entity.updatedAt = raw.updatedAt as Date;
    return entity;
  }

  static toPersistence(domain: Partial<Banner>): Partial<BannerSchemaClass> {
    const doc: Partial<BannerSchemaClass> = {};
    if (domain.imageUrl !== undefined) doc.imageUrl = domain.imageUrl;
    if (domain.titleEn !== undefined) doc.titleEn = domain.titleEn;
    if (domain.titleAr !== undefined) doc.titleAr = domain.titleAr;
    if (domain.linkUrl !== undefined) doc.linkUrl = domain.linkUrl;
    if (domain.sortOrder !== undefined) doc.sortOrder = domain.sortOrder;
    if (domain.isActive !== undefined) doc.isActive = domain.isActive;
    if (domain.startDate !== undefined) doc.startDate = domain.startDate;
    if (domain.endDate !== undefined) doc.endDate = domain.endDate;
    return doc;
  }
}
