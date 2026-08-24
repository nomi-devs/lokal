import { Types } from 'mongoose';
import { Address } from '../../../../domain/address';
import { AddressSchemaClass } from '../entities/address.schema';

export class AddressMapper {
  static toDomain(raw: AddressSchemaClass): Address {
    const domainEntity = new Address();
    domainEntity.id = raw._id.toString();
    domainEntity.userId = raw.userId.toString();
    domainEntity.label = raw.label;
    domainEntity.name = raw.name;
    domainEntity.country = raw.country;
    domainEntity.city = raw.city;
    domainEntity.phone = raw.phone;
    domainEntity.addressLine = raw.addressLine;
    domainEntity.isPrimary = raw.isPrimary;
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
    if (domainEntity.label !== undefined)
      persistence.label = domainEntity.label;
    if (domainEntity.name !== undefined) persistence.name = domainEntity.name;
    if (domainEntity.country !== undefined)
      persistence.country = domainEntity.country;
    if (domainEntity.city !== undefined) persistence.city = domainEntity.city;
    if (domainEntity.phone !== undefined)
      persistence.phone = domainEntity.phone;
    if (domainEntity.addressLine !== undefined)
      persistence.addressLine = domainEntity.addressLine;
    if (domainEntity.isPrimary !== undefined)
      persistence.isPrimary = domainEntity.isPrimary;
    return persistence;
  }
}
