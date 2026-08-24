import { Types } from 'mongoose';
import { Review } from '../../../../domain/review';
import { ReviewStatus } from '../../../../reviews.constants';
import { ReviewSchemaClass } from '../entities/review.schema';

export class ReviewMapper {
  static toDomain(raw: ReviewSchemaClass): Review {
    const domainEntity = new Review();
    domainEntity.id = raw._id.toString();
    domainEntity.productId = raw.productId.toString();
    domainEntity.vendorId = raw.vendorId.toString();
    domainEntity.orderId = raw.orderId.toString();
    domainEntity.customerId = raw.customerId.toString();
    domainEntity.rating = raw.rating;
    // Plain-copy the embedded subdocuments, not the Mongoose subdocument
    // instance itself — same precaution as ProductMapper.toDomain.
    domainEntity.title = { en: raw.title?.en ?? '', ar: raw.title?.ar };
    domainEntity.comment = { en: raw.comment?.en ?? '', ar: raw.comment?.ar };
    domainEntity.images = raw.images ?? [];
    domainEntity.isVerifiedPurchase = raw.isVerifiedPurchase;
    domainEntity.status = raw.status as ReviewStatus;
    domainEntity.rejectionReason = raw.rejectionReason;
    domainEntity.approvedAt = raw.approvedAt;
    domainEntity.createdAt = raw.createdAt as Date;
    domainEntity.updatedAt = raw.updatedAt as Date;
    return domainEntity;
  }

  static toPersistence(
    domainEntity: Partial<Review>,
  ): Partial<ReviewSchemaClass> {
    const persistence: Partial<ReviewSchemaClass> = {};
    if (domainEntity.productId !== undefined)
      persistence.productId = new Types.ObjectId(domainEntity.productId);
    if (domainEntity.vendorId !== undefined)
      persistence.vendorId = new Types.ObjectId(domainEntity.vendorId);
    if (domainEntity.orderId !== undefined)
      persistence.orderId = new Types.ObjectId(domainEntity.orderId);
    if (domainEntity.customerId !== undefined)
      persistence.customerId = new Types.ObjectId(domainEntity.customerId);
    if (domainEntity.rating !== undefined)
      persistence.rating = domainEntity.rating;
    if (domainEntity.title !== undefined)
      persistence.title = domainEntity.title;
    if (domainEntity.comment !== undefined)
      persistence.comment = domainEntity.comment;
    if (domainEntity.images !== undefined)
      persistence.images = domainEntity.images;
    if (domainEntity.isVerifiedPurchase !== undefined)
      persistence.isVerifiedPurchase = domainEntity.isVerifiedPurchase;
    if (domainEntity.status !== undefined)
      persistence.status = domainEntity.status;
    if (domainEntity.rejectionReason !== undefined)
      persistence.rejectionReason = domainEntity.rejectionReason;
    if (domainEntity.approvedAt !== undefined)
      persistence.approvedAt = domainEntity.approvedAt;
    return persistence;
  }
}
