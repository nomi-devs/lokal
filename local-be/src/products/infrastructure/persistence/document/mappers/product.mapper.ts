import { Types } from 'mongoose';
import { Product } from '../../../../domain/product';
import { ProductSchemaClass } from '../entities/product.schema';

export class ProductMapper {
  static toDomain(raw: ProductSchemaClass): Product {
    const domainEntity = new Product();
    domainEntity.id = raw._id.toString();
    domainEntity.vendorId = raw.vendorId.toString();
    domainEntity.categoryId = raw.categoryId
      ? raw.categoryId.toString()
      : undefined;
    domainEntity.department = raw.department;
    domainEntity.nameEn = raw.nameEn;
    domainEntity.nameAr = raw.nameAr;
    domainEntity.descriptionEn = raw.descriptionEn;
    domainEntity.descriptionAr = raw.descriptionAr;
    domainEntity.images = raw.images ?? [];
    // Plain-copy the embedded subdocuments — assigning the Mongoose
    // subdocument instance directly leaves circular internal refs on the
    // domain object, which blows the stack when class-transformer serializes it.
    domainEntity.price = {
      base: raw.price?.base ?? 0,
      currency: raw.price?.currency ?? 'KWD',
      compareAt: raw.price?.compareAt,
    };
    domainEntity.sizes = raw.sizes ?? [];
    domainEntity.colors = raw.colors ?? [];
    domainEntity.stock = raw.stock;
    domainEntity.status = raw.status;
    domainEntity.ratings = {
      average: raw.ratings?.average ?? 0,
      count: raw.ratings?.count ?? 0,
    };
    domainEntity.createdAt = raw.createdAt as Date;
    domainEntity.updatedAt = raw.updatedAt as Date;
    return domainEntity;
  }

  static toPersistence(
    domainEntity: Partial<Product>,
  ): Partial<ProductSchemaClass> {
    const persistence: Partial<ProductSchemaClass> = {};
    if (domainEntity.vendorId !== undefined)
      persistence.vendorId = new Types.ObjectId(domainEntity.vendorId);
    if (domainEntity.categoryId !== undefined)
      persistence.categoryId = new Types.ObjectId(domainEntity.categoryId);
    if (domainEntity.department !== undefined)
      persistence.department = domainEntity.department;
    if (domainEntity.nameEn !== undefined)
      persistence.nameEn = domainEntity.nameEn;
    if (domainEntity.nameAr !== undefined)
      persistence.nameAr = domainEntity.nameAr;
    if (domainEntity.descriptionEn !== undefined)
      persistence.descriptionEn = domainEntity.descriptionEn;
    if (domainEntity.descriptionAr !== undefined)
      persistence.descriptionAr = domainEntity.descriptionAr;
    if (domainEntity.images !== undefined)
      persistence.images = domainEntity.images;
    if (domainEntity.price !== undefined)
      persistence.price = domainEntity.price;
    if (domainEntity.sizes !== undefined)
      persistence.sizes = domainEntity.sizes;
    if (domainEntity.colors !== undefined)
      persistence.colors = domainEntity.colors;
    if (domainEntity.stock !== undefined)
      persistence.stock = domainEntity.stock;
    if (domainEntity.status !== undefined)
      persistence.status = domainEntity.status;
    if (domainEntity.ratings !== undefined)
      persistence.ratings = domainEntity.ratings;
    return persistence;
  }
}
