import { Types } from 'mongoose';
import { Address } from '../../../../domain/address';
import { AddressSchemaClass } from '../entities/address.schema';

export class AddressMapper {
  static toDomain(raw: AddressSchemaClass): Address {
    const domainEntity = new Address();
    domainEntity.id = raw._id.toString();
    domainEntity.userId = raw.userId.toString();
    domainEntity.type = raw.type;
    domainEntity.recipientName = raw.recipientName;
    domainEntity.country = raw.country;
    domainEntity.city = raw.city;
    domainEntity.phone = raw.phone;
    domainEntity.address = raw.address;
    domainEntity.isPrimary = raw.isPrimary;
    domainEntity.isDefault = raw.isDefault;
    domainEntity.createdAt = raw.createdAt as Date;
    domainEntity.updatedAt = raw.updatedAt as Date;
    return domainEntity;
  }

  static toPersistence(
    domainEntity: Partial<Address>,
  ): Partial<AddressSchemaClass> {
    const persistence: Partial<AddressSchemaClass> = {};
    if (domainEntity.userId !== undefined)
      persistence.userId = new Types.ObjectId(domainEntity.userId);
    if (domainEntity.type !== undefined) persistence.type = domainEntity.type;
    if (domainEntity.recipientName !== undefined)
      persistence.recipientName = domainEntity.recipientName;
    if (domainEntity.country !== undefined)
      persistence.country = domainEntity.country;
    if (domainEntity.city !== undefined) persistence.city = domainEntity.city;
    if (domainEntity.phone !== undefined)
      persistence.phone = domainEntity.phone;
    if (domainEntity.address !== undefined)
      persistence.address = domainEntity.address;
    if (domainEntity.isPrimary !== undefined)
      persistence.isPrimary = domainEntity.isPrimary;
    if (domainEntity.isDefault !== undefined)
      persistence.isDefault = domainEntity.isDefault;
    return persistence;
  }
}
