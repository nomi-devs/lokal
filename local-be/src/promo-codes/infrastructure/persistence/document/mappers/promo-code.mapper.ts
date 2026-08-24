import { Types } from 'mongoose';
import { PromoCode, DiscountType } from '../../../../domain/promo-code';
import { PromoCodeSchemaClass } from '../entities/promo-code.schema';

export class PromoCodeMapper {
  static toDomain(raw: PromoCodeSchemaClass): PromoCode {
    const entity = new PromoCode();
    entity.id = raw._id;
    entity.code = raw.code;
    entity.discountType = raw.discountType as DiscountType;
    entity.discountValue = raw.discountValue;
    entity.maxUsageCount = raw.maxUsageCount;
    entity.currentUsageCount = raw.currentUsageCount ?? 0;
    entity.applicableVendorIds = (raw.applicableVendorIds ?? []).map((id) =>
      id.toString(),
    );
    entity.applicableCategoryIds = raw.applicableCategoryIds ?? [];
    entity.minOrderValue = raw.minOrderValue;
    entity.maxDiscountCap = raw.maxDiscountCap;
    entity.validFrom = raw.validFrom;
    entity.validUntil = raw.validUntil;
    entity.isActive = raw.isActive;
    entity.lastUsedAt = raw.lastUsedAt;
    entity.createdBy = raw.createdBy.toString();
    entity.updatedBy = raw.updatedBy?.toString();
    entity.createdAt = raw.createdAt as Date;
    entity.updatedAt = raw.updatedAt as Date;
    return entity;
  }

  static toPersistence(
    domain: Partial<PromoCode>,
  ): Partial<PromoCodeSchemaClass> {
    const doc: Partial<PromoCodeSchemaClass> = {};
    if (domain.code !== undefined) doc.code = domain.code;
    if (domain.discountType !== undefined)
      doc.discountType = domain.discountType;
    if (domain.discountValue !== undefined)
      doc.discountValue = domain.discountValue;
    if (domain.maxUsageCount !== undefined)
      doc.maxUsageCount = domain.maxUsageCount;
    if (domain.currentUsageCount !== undefined)
      doc.currentUsageCount = domain.currentUsageCount;
    if (domain.applicableVendorIds !== undefined)
      doc.applicableVendorIds = domain.applicableVendorIds.map(
        (id) => new Types.ObjectId(id),
      );
    if (domain.applicableCategoryIds !== undefined)
      doc.applicableCategoryIds = domain.applicableCategoryIds;
    if (domain.minOrderValue !== undefined)
      doc.minOrderValue = domain.minOrderValue;
    if (domain.maxDiscountCap !== undefined)
      doc.maxDiscountCap = domain.maxDiscountCap;
    if (domain.validFrom !== undefined) doc.validFrom = domain.validFrom;
    if (domain.validUntil !== undefined) doc.validUntil = domain.validUntil;
    if (domain.isActive !== undefined) doc.isActive = domain.isActive;
    if (domain.lastUsedAt !== undefined) doc.lastUsedAt = domain.lastUsedAt;
    if (domain.createdBy !== undefined)
      doc.createdBy = new Types.ObjectId(domain.createdBy);
    if (domain.updatedBy !== undefined)
      doc.updatedBy = new Types.ObjectId(domain.updatedBy);
    return doc;
  }
}
