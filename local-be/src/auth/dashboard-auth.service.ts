import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { OtpService } from '../otp/otp.service';
import { EmailService } from '../email/email.service';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { resolveDeviceInfo } from '../common/utils/device-info.util';
import { SessionService } from './session.service';
import { LoginDto } from './dto/login.dto';
import { DashboardForgotPasswordDto } from './dto/dashboard-forgot-password.dto';
import { DashboardVerifyResetOtpDto } from './dto/dashboard-verify-reset-otp.dto';
import { DashboardResetPasswordDto } from './dto/dashboard-reset-password.dto';
import { LoginResponseDto, SendOtpResponseDto } from './dto/auth-response.dto';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';

// Password-only login for the dashboard (vendor + admin) — no OTP anywhere in
// the login flow itself. Mobile (customer) has its own
// MobileAuthService, phone+SMS based; forgotPassword/resetPassword below are
// this controller's own email+SMTP equivalent, since the dashboard collects
// email rather than phone.
@Injectable()
export class DashboardAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly vendorsService: VendorsService,
    private readonly sessionService: SessionService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}

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
    if (user.role !== 'vendor' && user.role !== 'admin') {
      throw new AppException(
        ERROR_CODES.FORBIDDEN,
        'Use the mobile app to log in to this account',
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

    // A vendor's own account can be 'active' while their store is still
    // pending/suspended/rejected — block dashboard access in all of those
    // cases rather than issuing tokens and letting the frontend decide,
    // same as the user.status checks above.
    let vendor: Awaited<ReturnType<VendorsService['findByUserId']>> = null;
    if (user.role === 'vendor') {
      vendor = await this.vendorsService.findByUserId(user.id);
      if (vendor && vendor.status !== 'active') {
        const messages: Record<string, string> = {
          pending_approval: 'Your account is pending admin approval.',
          suspended: 'Your vendor account has been suspended.',
          inactive: 'Your vendor account is inactive. Contact support.',
        };
        throw new AppException(
          ERROR_CODES.FORBIDDEN,
          messages[vendor.status] ??
            'Your vendor account is not active. Contact support.',
          403,
        );
      }
    }

    const deviceInfo = resolveDeviceInfo(request, dto.deviceInfo);
    const tokens = await this.sessionService.issueTokens(
      user.id,
      user.role,
      deviceInfo,
    );
    await this.usersService.touchLogin(user.id, deviceInfo.ip);

    const result: LoginResponseDto = { success: true, user, tokens };

    if (vendor) {
      result.vendor = {
        id: vendor.id,
        storeName: vendor.storeName,
        status: vendor.status,
      };
    }

    return result;
  }

  async forgotPassword(
    dto: DashboardForgotPasswordDto,
  ): Promise<SendOtpResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    // Deliberately don't reveal whether the email exists or belongs to a
    // vendor/admin — always return the same success response either way.
    if (user && (user.role === 'vendor' || user.role === 'admin')) {
      await this.otpService.assertNotRateLimited(dto.email);
      const otp = await this.otpService.generate(dto.email);
      await this.emailService.sendOtp(dto.email, otp);
    }

    const msg = MESSAGES.AUTH.FORGOT_PASSWORD(dto.email);
    return {
      success: true,
      message: msg.en,
      messageAr: msg.ar,
      expiresIn: this.otpService.expirySeconds,
    };
  }

  // Middle step of the 3-screen flow (email → verify code → set new
  // password): confirms the code without consuming it, so the UI can move
  // to the password screen before resetPassword's otpService.verify()
  // actually consumes it.
  async verifyResetOtp(
    dto: DashboardVerifyResetOtpDto,
  ): Promise<MessageResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
      throw new AppException(
        ERROR_CODES.USER_NOT_FOUND,
        'No account found for this email',
        404,
      );
    }

    await this.otpService.checkValid(dto.email, dto.otp);

    return {
      success: true,
      message: MESSAGES.AUTH.OTP_VERIFIED.en,
      messageAr: MESSAGES.AUTH.OTP_VERIFIED.ar,
    };
  }

  async resetPassword(
    dto: DashboardResetPasswordDto,
  ): Promise<MessageResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
      throw new AppException(
        ERROR_CODES.USER_NOT_FOUND,
        'No account found for this email',
        404,
      );
    }

    await this.otpService.verify(dto.email, dto.otp);
    await this.usersService.setPassword(user.id, dto.newPassword);

    return {
      success: true,
      message: MESSAGES.AUTH.PASSWORD_RESET.en,
      messageAr: MESSAGES.AUTH.PASSWORD_RESET.ar,
    };
  }
}
