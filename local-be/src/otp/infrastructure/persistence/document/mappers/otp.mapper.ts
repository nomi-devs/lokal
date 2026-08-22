import { Otp } from '../../../../domain/otp';
import { OtpSchemaClass } from '../entities/otp.schema';

export class OtpMapper {
  static toDomain(raw: OtpSchemaClass): Otp {
    const domainEntity = new Otp();
    domainEntity.id = raw._id.toString();
    domainEntity.phone = raw.phone;
    domainEntity.otpHash = raw.otpHash;
    domainEntity.expiresAt = raw.expiresAt;
    domainEntity.attempts = raw.attempts;
    domainEntity.isUsed = raw.isUsed;
    domainEntity.createdAt = raw.createdAt as Date;
    return domainEntity;
  }
}
