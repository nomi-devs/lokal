import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { DeviceInfo } from '../common/utils/device-info.util';
import { AllConfigType } from '../config/config.type';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import {
  MeResponseDto,
  RefreshTokenResponseDto,
  TokensDto,
} from './dto/auth-response.dto';
import { MessageResponseDto } from '../common/dto/message-response.dto';

// Token issuing/refresh/logout/me are identical for mobile and dashboard —
// both DashboardAuthService and MobileAuthService delegate here so that
// having two separate URL namespaces doesn't mean two copies of the JWT logic.
@Injectable()
export class SessionService {
  constructor(
    private readonly usersService: UsersService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async issueTokens(
    userId: string,
    role: string,
    deviceInfo: DeviceInfo,
  ): Promise<TokensDto> {
    const accessToken = this.signAccessToken(userId, role);
    const refreshToken = this.signRefreshToken(userId);
    await this.refreshTokensService.issue(userId, refreshToken, deviceInfo);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.getOrThrow('auth.jwtAccessExpirySeconds', {
        infer: true,
      }),
      refreshExpiresIn: this.configService.getOrThrow(
        'auth.jwtRefreshExpirySeconds',
        { infer: true },
      ),
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.getOrThrow('auth.jwtRefreshSecret', {
          infer: true,
        }),
      });
    } catch (error) {
      const isExpired =
        error instanceof Error && error.name === 'TokenExpiredError';
      throw new AppException(
        isExpired ? ERROR_CODES.TOKEN_EXPIRED : ERROR_CODES.INVALID_TOKEN,
        isExpired
          ? 'Refresh token expired. Please login again.'
          : 'Invalid or expired token. Please login again.',
        401,
      );
    }

    const session = await this.refreshTokensService.findValid(dto.refreshToken);
    if (!session) {
      throw new AppException(
        ERROR_CODES.INVALID_TOKEN,
        'Invalid or expired token. Please login again.',
        401,
      );
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || user.status !== 'active') {
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'Authentication required',
        401,
      );
    }

    return {
      success: true,
      accessToken: this.signAccessToken(user.id, user.role),
      expiresIn: this.configService.getOrThrow('auth.jwtAccessExpirySeconds', {
        infer: true,
      }),
    };
  }

  async logout(userId: string, dto: LogoutDto): Promise<MessageResponseDto> {
    if (dto.refreshToken) {
      await this.refreshTokensService.revoke(dto.refreshToken);
    } else {
      await this.refreshTokensService.revokeAllForUser(userId);
    }

    if (dto.fcmToken) {
      await this.usersService.removeFcmTokenByToken(userId, dto.fcmToken);
    }

    return { success: true, message: 'Logged out successfully' };
  }

  async me(userId: string): Promise<MeResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new AppException(ERROR_CODES.USER_NOT_FOUND, 'User not found', 404);
    }
    return { success: true, user };
  }

  private signAccessToken(userId: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, role },
      {
        secret: this.configService.getOrThrow('auth.jwtSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.jwtAccessExpiresIn', {
          infer: true,
        }),
        issuer: 'beta-api',
      },
    );
  }

  private signRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: this.configService.getOrThrow('auth.jwtRefreshSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.jwtRefreshExpiresIn', {
          infer: true,
        }),
        issuer: 'beta-api',
      },
    );
  }
}
