import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NullableType } from '../utils/types/nullable.type';
import { sha256 } from '../common/utils/hash.util';
import { DeviceInfo } from '../common/utils/device-info.util';
import { AllConfigType } from '../config/config.type';
import { RefreshToken } from './domain/refresh-token';
import { RefreshTokenRepository } from './infrastructure/persistence/refresh-token.repository';

@Injectable()
export class RefreshTokensService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async issue(
    userId: string,
    token: string,
    deviceInfo: DeviceInfo,
  ): Promise<void> {
    await this.enforceSessionLimit(userId);
    const expirySeconds = this.configService.getOrThrow(
      'auth.jwtRefreshExpirySeconds',
      { infer: true },
    );
    await this.refreshTokenRepository.create({
      userId,
      tokenHash: sha256(token),
      deviceInfo,
      expiresAt: new Date(Date.now() + expirySeconds * 1000),
    });
  }

  findValid(token: string): Promise<NullableType<RefreshToken>> {
    return this.refreshTokenRepository.findValidByTokenHash(sha256(token));
  }

  revoke(token: string): Promise<void> {
    return this.refreshTokenRepository.revokeByTokenHash(sha256(token));
  }

  revokeAllForUser(userId: string): Promise<void> {
    return this.refreshTokenRepository.revokeAllForUser(userId);
  }

  // Caps concurrent sessions per spec 10.4 ("Can have 5 active sessions per
  // user") by revoking the oldest session(s) before a new one is issued.
  private async enforceSessionLimit(userId: string): Promise<void> {
    const maxActiveSessions = this.configService.getOrThrow(
      'auth.maxActiveSessions',
      { infer: true },
    );
    const activeSessions =
      await this.refreshTokenRepository.findActiveByUser(userId);

    const overflow = activeSessions.length - (maxActiveSessions - 1);
    if (overflow > 0) {
      const idsToRevoke = activeSessions
        .slice(0, overflow)
        .map((session) => session.id);
      await this.refreshTokenRepository.revokeMany(idsToRevoke);
    }
  }
}
