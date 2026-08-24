import { Category } from '../../../../domain/category';
import { CategorySchemaClass } from '../entities/category.schema';

export class CategoryMapper {
  static toDomain(raw: CategorySchemaClass): Category {
    const domainEntity = new Category();
    domainEntity.id = raw._id;
    domainEntity.nameEn = raw.nameEn;
    domainEntity.nameAr = raw.nameAr;
    domainEntity.descriptionEn = raw.descriptionEn;
    domainEntity.descriptionAr = raw.descriptionAr;
    domainEntity.imageUrl = raw.imageUrl;
    domainEntity.parentId = raw.parentId ?? null;
    domainEntity.department = raw.department ?? 'unisex';
    domainEntity.sortOrder = raw.sortOrder ?? 0;
    domainEntity.isActive = raw.isActive;
    domainEntity.createdAt = raw.createdAt as Date;
    domainEntity.updatedAt = raw.updatedAt as Date;
    return domainEntity;
  }

  static toPersistence(
    domainEntity: Partial<Category>,
  ): Partial<CategorySchemaClass> {
    const persistence: Partial<CategorySchemaClass> = {};
    if (domainEntity.nameEn !== undefined)
      persistence.nameEn = domainEntity.nameEn;
    if (domainEntity.nameAr !== undefined)
      persistence.nameAr = domainEntity.nameAr;
    if (domainEntity.descriptionEn !== undefined)
      persistence.descriptionEn = domainEntity.descriptionEn;
    if (domainEntity.descriptionAr !== undefined)
      persistence.descriptionAr = domainEntity.descriptionAr;
    if (domainEntity.imageUrl !== undefined)
      persistence.imageUrl = domainEntity.imageUrl;
    if (domainEntity.parentId !== undefined)
      persistence.parentId = domainEntity.parentId;
    if (domainEntity.department !== undefined)
      persistence.department = domainEntity.department;
    if (domainEntity.sortOrder !== undefined)
      persistence.sortOrder = domainEntity.sortOrder;
    if (domainEntity.isActive !== undefined)
      persistence.isActive = domainEntity.isActive;
    return persistence;
  }
}
