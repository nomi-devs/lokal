import { RefreshToken } from '../../../../domain/refresh-token';
import { RefreshTokenSchemaClass } from '../entities/refresh-token.schema';

export class RefreshTokenMapper {
  static toDomain(raw: RefreshTokenSchemaClass): RefreshToken {
    const domainEntity = new RefreshToken();
    domainEntity.id = raw._id.toString();
    domainEntity.userId = raw.userId.toString();
    domainEntity.tokenHash = raw.tokenHash;
    // Plain-copy the embedded subdocument — see user.mapper.ts for why.
    domainEntity.deviceInfo = {
      userAgent: raw.deviceInfo?.userAgent,
      ip: raw.deviceInfo?.ip,
      device: raw.deviceInfo?.device,
    };
    domainEntity.expiresAt = raw.expiresAt;
    domainEntity.isRevoked = raw.isRevoked;
    domainEntity.createdAt = raw.createdAt as Date;
    return domainEntity;
  }
}
