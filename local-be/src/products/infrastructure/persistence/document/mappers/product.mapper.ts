import { Types } from 'mongoose';
import { Product } from '../../../../domain/product';
import { ProductSchemaClass } from '../entities/product.schema';

export class ProductMapper {
  static toDomain(raw: ProductSchemaClass): Product {
    const domainEntity = new Product();
    domainEntity.id = raw._id.toString();
    domainEntity.vendorId = raw.vendorId.toString();
    domainEntity.categoryId = raw.categoryId;
    domainEntity.gender = raw.gender;
    // Plain-copy the embedded subdocuments — assigning the Mongoose
    // subdocument instance directly leaves circular internal refs on the
    // domain object, which blows the stack when class-transformer serializes it.
    domainEntity.name = { en: raw.name?.en ?? '', ar: raw.name?.ar };
    domainEntity.description = {
      en: raw.description?.en ?? '',
      ar: raw.description?.ar,
    };
    domainEntity.images = raw.images ?? [];
    domainEntity.price = raw.price;
    domainEntity.compareAtPrice = raw.compareAtPrice;
    domainEntity.sizes = raw.sizes ?? [];
    domainEntity.colors = raw.colors ?? [];
    domainEntity.stock = raw.stock;
    domainEntity.inStock = raw.inStock;
    domainEntity.status = raw.status;
    domainEntity.rejectionReason = raw.rejectionReason;
    domainEntity.rating = raw.rating ?? 0;
    domainEntity.ratingCount = raw.ratingCount ?? 0;
    domainEntity.salesCount = raw.salesCount ?? 0;
    domainEntity.viewCount = raw.viewCount ?? 0;
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
      persistence.categoryId = domainEntity.categoryId;
    if (domainEntity.gender !== undefined)
      persistence.gender = domainEntity.gender;
    if (domainEntity.name !== undefined) persistence.name = domainEntity.name;
    if (domainEntity.description !== undefined)
      persistence.description = domainEntity.description;
    if (domainEntity.images !== undefined)
      persistence.images = domainEntity.images;
    if (domainEntity.price !== undefined)
      persistence.price = domainEntity.price;
    if (domainEntity.compareAtPrice !== undefined)
      persistence.compareAtPrice = domainEntity.compareAtPrice;
    if (domainEntity.sizes !== undefined)
      persistence.sizes = domainEntity.sizes;
    if (domainEntity.colors !== undefined)
      persistence.colors = domainEntity.colors;
    if (domainEntity.stock !== undefined)
      persistence.stock = domainEntity.stock;
    if (domainEntity.inStock !== undefined)
      persistence.inStock = domainEntity.inStock;
    if (domainEntity.status !== undefined)
      persistence.status = domainEntity.status;
    if (domainEntity.rejectionReason !== undefined)
      persistence.rejectionReason = domainEntity.rejectionReason;
    if (domainEntity.rating !== undefined)
      persistence.rating = domainEntity.rating;
    if (domainEntity.ratingCount !== undefined)
      persistence.ratingCount = domainEntity.ratingCount;
    if (domainEntity.salesCount !== undefined)
      persistence.salesCount = domainEntity.salesCount;
    if (domainEntity.viewCount !== undefined)
      persistence.viewCount = domainEntity.viewCount;
    return persistence;
  }
}
