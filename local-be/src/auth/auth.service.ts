import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { OtpService } from '../otp/otp.service';
import { SmsService } from '../sms/sms.service';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { resolveDeviceInfo } from '../common/utils/device-info.util';
import { AllConfigType } from '../config/config.type';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import {
  LoginResponseDto,
  MeResponseDto,
  RefreshTokenResponseDto,
  SendOtpResponseDto,
  TokensDto,
  VerifyOtpResponseDto,
} from './dto/auth-response.dto';
import { MessageResponseDto } from '../common/dto/message-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly vendorsService: VendorsService,
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async sendOtp(dto: SendOtpDto): Promise<SendOtpResponseDto> {
    const existing = await this.usersService.findByPhone(dto.phone);
    if (existing) {
      if (existing.status === 'suspended') {
        throw new AppException(
          ERROR_CODES.USER_SUSPENDED,
          'Your account has been suspended',
          403,
        );
      }
      if (existing.passwordHash) {
        throw new AppException(
          ERROR_CODES.FORBIDDEN,
          'This account uses password login. Use POST /auth/login instead.',
          403,
        );
      }
    }

    await this.otpService.assertNotRateLimited(dto.phone);
    const otp = await this.otpService.generate(dto.phone);
    await this.smsService.sendOtp(dto.phone, otp);

    return {
      success: true,
      message: `OTP sent to ${dto.phone}`,
      expiresIn: this.otpService.expirySeconds,
    };
  }

  async verifyOtp(
    dto: VerifyOtpDto,
    request: Request,
  ): Promise<VerifyOtpResponseDto> {
    await this.otpService.verify(dto.phone, dto.otp);

    let user = await this.usersService.findByPhone(dto.phone);
    const isNewUser = !user;
    if (!user) {
      user = await this.usersService.createCustomer(dto.phone);
    }

    if (user.status === 'suspended') {
      throw new AppException(
        ERROR_CODES.USER_SUSPENDED,
        'Your account has been suspended',
        403,
      );
    }
    if (user.passwordHash) {
      throw new AppException(
        ERROR_CODES.FORBIDDEN,
        'This account uses password login. Use POST /auth/login instead.',
        403,
      );
    }

    if (dto.fcmToken && dto.device) {
      await this.usersService.registerFcmToken(user.id, {
        fcmToken: dto.fcmToken,
        device: dto.device,
      });
    }

    const deviceInfo = resolveDeviceInfo(request, dto.deviceInfo);
    const tokens = await this.issueTokens(user.id, user.role, deviceInfo);
    await this.usersService.touchLogin(user.id, deviceInfo.ip);

    return { success: true, user, tokens, isNewUser };
  }

  async login(dto: LoginDto, request: Request): Promise<LoginResponseDto> {
    const user = await this.usersService.findByIdentifierWithPassword(
      dto.identifier,
    );
    if (!user || !user.passwordHash) {
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'Invalid credentials',
        401,
      );
    }
    if (user.status === 'suspended') {
      throw new AppException(
        ERROR_CODES.USER_SUSPENDED,
        'Your account has been suspended',
        403,
      );
    }
    if (user.status === 'inactive') {
      throw new AppException(
        ERROR_CODES.FORBIDDEN,
        'Your account is inactive. Contact support.',
        403,
      );
    }

    const matches = await this.usersService.verifyPassword(user, dto.password);
    if (!matches) {
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'Invalid credentials',
        401,
      );
    }

    const deviceInfo = resolveDeviceInfo(request, dto.deviceInfo);
    const tokens = await this.issueTokens(user.id, user.role, deviceInfo);
    await this.usersService.touchLogin(user.id, deviceInfo.ip);

    const result: LoginResponseDto = { success: true, user, tokens };

    if (user.role === 'vendor') {
      const vendor = await this.vendorsService.findByUserId(user.id);
      if (vendor) {
        result.vendor = {
          id: vendor.id,
          storeName: vendor.storeName,
          status: vendor.status,
          ...(vendor.status === 'pending_approval'
            ? { message: 'Your account is pending admin approval' }
            : {}),
        };
      }
    }

    return result;
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

  private async issueTokens(
    userId: string,
    role: string,
    deviceInfo: ReturnType<typeof resolveDeviceInfo>,
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
