import { NullableType } from '../../../utils/types/nullable.type';
import { Otp } from '../../domain/otp';

export abstract class OtpRepository {
  abstract create(data: {
    phone: string;
    otpHash: string;
    expiresAt: Date;
  }): Promise<Otp>;
  abstract findLatestByPhone(phone: string): Promise<NullableType<Otp>>;
  abstract countCreatedSince(phone: string, since: Date): Promise<number>;
  abstract markUsed(id: string): Promise<void>;
  abstract incrementAttempts(id: string): Promise<number>;
}
