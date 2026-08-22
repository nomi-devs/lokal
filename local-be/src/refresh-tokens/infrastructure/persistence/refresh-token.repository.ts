import { NullableType } from '../../../utils/types/nullable.type';
import {
  RefreshToken,
  RefreshTokenDeviceInfo,
} from '../../domain/refresh-token';

export abstract class RefreshTokenRepository {
  abstract create(data: {
    userId: string;
    tokenHash: string;
    deviceInfo: RefreshTokenDeviceInfo;
    expiresAt: Date;
  }): Promise<RefreshToken>;

  abstract findValidByTokenHash(
    tokenHash: string,
  ): Promise<NullableType<RefreshToken>>;
  abstract findActiveByUser(userId: string): Promise<RefreshToken[]>;

  abstract revokeByTokenHash(tokenHash: string): Promise<void>;
  abstract revokeAllForUser(userId: string): Promise<void>;
  abstract revokeMany(ids: string[]): Promise<void>;
}
