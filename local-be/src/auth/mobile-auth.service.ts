import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { SmsService } from '../sms/sms.service';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { resolveDeviceInfo } from '../common/utils/device-info.util';
import { SessionService } from './session.service';
import { MobileRegisterDto } from './dto/mobile-register.dto';
import { VerifyRegistrationOtpDto } from './dto/verify-registration-otp.dto';
import { MobileLoginDto } from './dto/mobile-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  MobileAuthResponseDto,
  SendOtpResponseDto,
} from './dto/auth-response.dto';

// Password-based login for customers/drivers (mobile app). OTP is used only
// to verify phone ownership at registration and for forgot-password — never
// on every login. Dashboard (vendor/admin) has its own DashboardAuthService.
@Injectable()
export class MobileAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
    private readonly sessionService: SessionService,
  ) {}

  async sendRegistrationOtp(
    dto: MobileRegisterDto,
  ): Promise<SendOtpResponseDto> {
    const existing = await this.usersService.findByPhone(dto.phone);
    if (existing?.passwordHash) {
      throw new AppException(
        ERROR_CODES.USER_ALREADY_EXISTS,
        'An account already exists for this phone',
        409,
      );
    }
    if (existing?.status === 'suspended') {
      throw new AppException(
        ERROR_CODES.USER_SUSPENDED,
        'Your account has been suspended',
        403,
      );
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

  async verifyRegistrationOtp(
    dto: VerifyRegistrationOtpDto,
    request: Request,
  ): Promise<MobileAuthResponseDto> {
    await this.otpService.verify(dto.phone, dto.otp);

    const user = await this.usersService.createWithPassword({
      phone: dto.phone,
      firstName: dto.firstName ?? '',
      lastName: dto.lastName ?? '',
      password: dto.password,
      role: 'customer',
    });

    if (dto.fcmToken && dto.device) {
      await this.usersService.registerFcmToken(user.id, {
        fcmToken: dto.fcmToken,
        device: dto.device,
      });
    }

    const deviceInfo = resolveDeviceInfo(request, dto.deviceInfo);
    const tokens = await this.sessionService.issueTokens(
      user.id,
      user.role,
      deviceInfo,
    );
    await this.usersService.touchLogin(user.id, deviceInfo.ip);

    return { success: true, user, tokens, isNewUser: true };
  }

  async login(
    dto: MobileLoginDto,
    request: Request,
  ): Promise<MobileAuthResponseDto> {
    const user = await this.usersService.findByIdentifierWithPassword(
      dto.phone,
    );
    if (!user || !user.passwordHash) {
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'Invalid credentials',
        401,
      );
    }
    if (user.role !== 'customer' && user.role !== 'driver') {
      throw new AppException(
        ERROR_CODES.FORBIDDEN,
        'Use the dashboard to log in to this account',
        403,
      );
    }
    if (user.status === 'suspended') {
      throw new AppException(
        ERROR_CODES.USER_SUSPENDED,
        'Your account has been suspended',
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
    const tokens = await this.sessionService.issueTokens(
      user.id,
      user.role,
      deviceInfo,
    );
    await this.usersService.touchLogin(user.id, deviceInfo.ip);

    return { success: true, user, tokens, isNewUser: false };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<SendOtpResponseDto> {
    const user = await this.usersService.findByPhone(dto.phone);
    if (!user || !user.passwordHash) {
      throw new AppException(
        ERROR_CODES.USER_NOT_FOUND,
        'No account found for this phone',
        404,
      );
    }
    if (user.status === 'suspended') {
      throw new AppException(
        ERROR_CODES.USER_SUSPENDED,
        'Your account has been suspended',
        403,
      );
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

  async resetPassword(
    dto: ResetPasswordDto,
    request: Request,
  ): Promise<MobileAuthResponseDto> {
    await this.otpService.verify(dto.phone, dto.otp);

    const user = await this.usersService.findByPhone(dto.phone);
    if (!user) {
      throw new AppException(
        ERROR_CODES.USER_NOT_FOUND,
        'No account found for this phone',
        404,
      );
    }

    await this.usersService.setPassword(user.id, dto.newPassword);

    const deviceInfo = resolveDeviceInfo(request, dto.deviceInfo);
    const tokens = await this.sessionService.issueTokens(
      user.id,
      user.role,
      deviceInfo,
    );
    await this.usersService.touchLogin(user.id, deviceInfo.ip);

    return { success: true, user, tokens, isNewUser: false };
  }
}
