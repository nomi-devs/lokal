import { Types } from 'mongoose';
import { Vendor } from '../../../../domain/vendor';
import { VendorSchemaClass } from '../entities/vendor.schema';

export class VendorMapper {
  static toDomain(raw: VendorSchemaClass): Vendor {
    const domainEntity = new Vendor();
    domainEntity.id = raw._id.toString();
    domainEntity.userId = raw.userId.toString();
    domainEntity.storeName = raw.storeName;
    domainEntity.storeDescription = raw.storeDescription;
    domainEntity.city = raw.city;
    domainEntity.country = raw.country;
    domainEntity.address = raw.address;
    domainEntity.phone = raw.phone;
    domainEntity.businessLicense = raw.businessLicense;
    domainEntity.logoUrl = raw.logoUrl;
    domainEntity.kycDocumentUrl = raw.kycDocumentUrl;
    domainEntity.status = raw.status;
    domainEntity.approvedAt = raw.approvedAt;
    domainEntity.approvedBy = raw.approvedBy
      ? raw.approvedBy.toString()
      : undefined;
    domainEntity.approvalNotes = raw.approvalNotes;
    domainEntity.rejectionReason = raw.rejectionReason;
    domainEntity.rejectionCategory = raw.rejectionCategory;
    domainEntity.suspendReason = raw.suspendReason;
    domainEntity.suspendedUntil = raw.suspendedUntil;
    domainEntity.rating = raw.rating;
    domainEntity.totalReviews = raw.totalReviews;
    domainEntity.deletedAt = raw.deletedAt;
    domainEntity.createdAt = raw.createdAt as Date;
    domainEntity.updatedAt = raw.updatedAt as Date;
    return domainEntity;
  }

  static toPersistence(
    domainEntity: Partial<Vendor>,
  ): Partial<VendorSchemaClass> {
    const persistence: Partial<VendorSchemaClass> = {};
    if (domainEntity.userId !== undefined)
      persistence.userId = new Types.ObjectId(domainEntity.userId);
    if (domainEntity.storeName !== undefined)
      persistence.storeName = domainEntity.storeName;
    if (domainEntity.storeDescription !== undefined)
      persistence.storeDescription = domainEntity.storeDescription;
    if (domainEntity.city !== undefined) persistence.city = domainEntity.city;
    if (domainEntity.country !== undefined)
      persistence.country = domainEntity.country;
    if (domainEntity.address !== undefined)
      persistence.address = domainEntity.address;
    if (domainEntity.phone !== undefined)
      persistence.phone = domainEntity.phone;
    if (domainEntity.businessLicense !== undefined)
      persistence.businessLicense = domainEntity.businessLicense;
    if (domainEntity.logoUrl !== undefined)
      persistence.logoUrl = domainEntity.logoUrl;
    if (domainEntity.kycDocumentUrl !== undefined)
      persistence.kycDocumentUrl = domainEntity.kycDocumentUrl;
    if (domainEntity.status !== undefined)
      persistence.status = domainEntity.status;
    if (domainEntity.approvedAt !== undefined)
      persistence.approvedAt = domainEntity.approvedAt;
    if (domainEntity.approvedBy !== undefined)
      persistence.approvedBy = new Types.ObjectId(domainEntity.approvedBy);
    if (domainEntity.approvalNotes !== undefined)
      persistence.approvalNotes = domainEntity.approvalNotes;
    if (domainEntity.rejectionReason !== undefined)
      persistence.rejectionReason = domainEntity.rejectionReason;
    if (domainEntity.rejectionCategory !== undefined)
      persistence.rejectionCategory = domainEntity.rejectionCategory;
    if (domainEntity.suspendReason !== undefined)
      persistence.suspendReason = domainEntity.suspendReason;
    if (domainEntity.suspendedUntil !== undefined)
      persistence.suspendedUntil = domainEntity.suspendedUntil;
    if (domainEntity.deletedAt !== undefined)
      persistence.deletedAt = domainEntity.deletedAt;
    return persistence;
  }
}
