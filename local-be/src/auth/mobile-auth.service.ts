import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { SmsService } from '../sms/sms.service';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { resolveDeviceInfo } from '../common/utils/device-info.util';
import { SessionService } from './session.service';
import { SendMobileOtpDto } from './dto/send-mobile-otp.dto';
import { VerifyMobileOtpDto } from './dto/verify-mobile-otp.dto';
import {
  MobileAuthResponseDto,
  SendOtpResponseDto,
} from './dto/auth-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';

// Pure OTP auth for the mobile app (customers only — the only roles are
// customer, vendor, admin) — phone in, code back, logged in. No password
// anywhere in this flow: sendOtp behaves
// identically whether the phone is new or returning, and verifyOtp creates
// the account on first use. Dashboard (vendor/admin) is unrelated — see
// DashboardAuthService for that password-based flow at /dashboard/auth.
@Injectable()
export class MobileAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
    private readonly sessionService: SessionService,
  ) {}

  async sendOtp(dto: SendMobileOtpDto): Promise<SendOtpResponseDto> {
    const existing = await this.usersService.findByPhone(dto.phone);
    if (existing) {
      this.assertMobileAccessible(existing.role, existing.status);
    }

    await this.otpService.assertNotRateLimited(dto.phone);
    const otp = await this.otpService.generate(dto.phone);
    await this.smsService.sendOtp(dto.phone, otp);

    const msg = MESSAGES.AUTH.OTP_SENT(dto.phone);
    return {
      success: true,
      message: msg.en,
      messageAr: msg.ar,
      expiresIn: this.otpService.expirySeconds,
    };
  }

  async verifyOtp(
    dto: VerifyMobileOtpDto,
    request: Request,
  ): Promise<MobileAuthResponseDto> {
    await this.otpService.verify(dto.phone, dto.otp);

    let user = await this.usersService.findByPhone(dto.phone);
    const isNewUser = !user;

    if (user) {
      this.assertMobileAccessible(user.role, user.status);
    } else {
      user = await this.usersService.createCustomer(dto.phone);
    }

    const deviceInfo = resolveDeviceInfo(request, dto.deviceInfo);
    const tokens = await this.sessionService.issueTokens(
      user.id,
      user.role,
      deviceInfo,
    );
    await this.usersService.touchLogin(user.id, deviceInfo.ip);

    return { success: true, user, tokens, isNewUser };
  }

  // Shared guard for an existing account hit via sendOtp or verifyOtp —
  // vendor/admin phones belong on the dashboard, not this app, and a
  // suspended account can't get in either way.
  private assertMobileAccessible(role: string, status: string): void {
    if (role !== 'customer') {
      throw new AppException(
        ERROR_CODES.FORBIDDEN,
        'Use the dashboard to log in to this account',
        403,
      );
    }
    if (status === 'suspended') {
      throw new AppException(
        ERROR_CODES.USER_SUSPENDED,
        'Your account has been suspended',
        403,
      );
    }
  }
}
