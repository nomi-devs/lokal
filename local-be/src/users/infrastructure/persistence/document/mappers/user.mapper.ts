import { Types } from 'mongoose';
import { User } from '../../../../domain/user';
import { UserSchemaClass } from '../entities/user.schema';

export class UserMapper {
  static toDomain(raw: UserSchemaClass): User {
    const domainEntity = new User();
    domainEntity.id = raw._id.toString();
    domainEntity.phone = raw.phone;
    domainEntity.email = raw.email;
    domainEntity.firstName = raw.firstName;
    domainEntity.lastName = raw.lastName;
    domainEntity.photoUrl = raw.photoUrl;
    domainEntity.passwordHash = raw.passwordHash;
    domainEntity.role = raw.role;
    domainEntity.status = raw.status;
    domainEntity.vendorId = raw.vendorId ? raw.vendorId.toString() : undefined;
    domainEntity.language = raw.language;
    domainEntity.timezone = raw.timezone;
    // Plain-copy each embedded subdocument — assigning Mongoose subdocuments
    // directly leaves circular internal refs (parent/$__) on the domain
    // object, which blows the stack when class-transformer serializes it.
    domainEntity.fcmTokens = (raw.fcmTokens ?? []).map((t) => ({
      token: t.token,
      device: t.device,
      addedAt: t.addedAt,
      lastUsedAt: t.lastUsedAt,
    }));
    domainEntity.notificationsEnabled = raw.notificationsEnabled;
    domainEntity.lastLogin = raw.lastLogin;
    domainEntity.lastLoginIp = raw.lastLoginIp;
    domainEntity.loginAttempts = raw.loginAttempts;
    domainEntity.isPhoneVerified = raw.isPhoneVerified;
    domainEntity.rating = raw.rating;
    domainEntity.reviewCount = raw.reviewCount;
    domainEntity.deletedAt = raw.deletedAt;
    domainEntity.createdAt = raw.createdAt as Date;
    domainEntity.updatedAt = raw.updatedAt as Date;
    return domainEntity;
  }

  static toPersistence(domainEntity: Partial<User>): Partial<UserSchemaClass> {
    const persistence: Partial<UserSchemaClass> = {};
    if (domainEntity.phone !== undefined)
      persistence.phone = domainEntity.phone;
    if (domainEntity.email !== undefined)
      persistence.email = domainEntity.email;
    if (domainEntity.firstName !== undefined)
      persistence.firstName = domainEntity.firstName;
    if (domainEntity.lastName !== undefined)
      persistence.lastName = domainEntity.lastName;
    if (domainEntity.photoUrl !== undefined)
      persistence.photoUrl = domainEntity.photoUrl;
    if (domainEntity.passwordHash !== undefined)
      persistence.passwordHash = domainEntity.passwordHash;
    if (domainEntity.role !== undefined) persistence.role = domainEntity.role;
    if (domainEntity.status !== undefined)
      persistence.status = domainEntity.status;
    if (domainEntity.vendorId !== undefined) {
      persistence.vendorId = new Types.ObjectId(domainEntity.vendorId);
    }
    if (domainEntity.language !== undefined)
      persistence.language = domainEntity.language;
    if (domainEntity.timezone !== undefined)
      persistence.timezone = domainEntity.timezone;
    if (domainEntity.lastLogin !== undefined)
      persistence.lastLogin = domainEntity.lastLogin;
    if (domainEntity.lastLoginIp !== undefined)
      persistence.lastLoginIp = domainEntity.lastLoginIp;
    if (domainEntity.isPhoneVerified !== undefined)
      persistence.isPhoneVerified = domainEntity.isPhoneVerified;
    if (domainEntity.notificationsEnabled !== undefined)
      persistence.notificationsEnabled = domainEntity.notificationsEnabled;
    if (domainEntity.deletedAt !== undefined)
      persistence.deletedAt = domainEntity.deletedAt;
    return persistence;
  }
}
