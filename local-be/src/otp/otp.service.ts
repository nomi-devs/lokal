import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { compareWithBcrypt, hashWithBcrypt } from '../common/utils/hash.util';
import { AllConfigType } from '../config/config.type';
import { OtpRepository } from './infrastructure/persistence/otp.repository';

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  get expirySeconds(): number {
    return (
      this.configService.getOrThrow('auth.otpExpiryMinutes', { infer: true }) *
      60
    );
  }

  async assertNotRateLimited(phone: string): Promise<void> {
    const maxPerHour = this.configService.getOrThrow(
      'auth.otpMaxRequestsPerHour',
      { infer: true },
    );
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const count = await this.otpRepository.countCreatedSince(phone, since);
    if (count >= maxPerHour) {
      throw new AppException(
        ERROR_CODES.OTP_REQUEST_RATE_LIMIT,
        `Max ${maxPerHour} OTP requests per hour. Try again later.`,
        429,
      );
    }
  }

  async generate(phone: string): Promise<string> {
    const otp = this.randomOtp();
    const rounds = this.configService.getOrThrow('auth.bcryptRounds', {
      infer: true,
    });
    const otpHash = await hashWithBcrypt(otp, rounds);
    await this.otpRepository.create({
      phone,
      otpHash,
      expiresAt: new Date(Date.now() + this.expirySeconds * 1000),
    });
    return otp;
  }

  // Validates without consuming — lets a multi-step flow (e.g. dashboard
  // forgot-password) confirm the code is correct on its own screen, before a
  // later step calls verify() to actually consume it. Still enforces the
  // same expiry/already-used/attempts rules and increments attempts on a
  // wrong guess, so brute-force protection isn't weakened by peeking.
  async checkValid(phone: string, otp: string): Promise<void> {
    const record = await this.otpRepository.findLatestByPhone(phone);

    if (!record) {
      throw new AppException(
        ERROR_CODES.INVALID_OTP,
        'No OTP requested for this phone. Request a new one.',
        400,
      );
    }

    if (record.isUsed) {
      throw new AppException(
        ERROR_CODES.OTP_ALREADY_USED,
        'OTP already used. Request a new one.',
        400,
      );
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new AppException(
        ERROR_CODES.OTP_EXPIRED,
        'OTP has expired. Request a new one.',
        400,
      );
    }

    const maxAttempts = this.configService.getOrThrow('auth.otpMaxAttempts', {
      infer: true,
    });
    if (record.attempts >= maxAttempts) {
      await this.otpRepository.markUsed(record.id);
      throw new AppException(
        ERROR_CODES.TOO_MANY_OTP_ATTEMPTS,
        'Too many attempts. Request a new OTP.',
        429,
      );
    }

    const matches = await compareWithBcrypt(otp, record.otpHash);
    if (!matches) {
      const attempts = await this.otpRepository.incrementAttempts(record.id);
      const remaining = Math.max(maxAttempts - attempts, 0);
      throw new AppException(
        ERROR_CODES.INVALID_OTP,
        `OTP is incorrect. ${remaining} attempts remaining.`,
        400,
      );
    }
  }

  async verify(phone: string, otp: string): Promise<void> {
    await this.checkValid(phone, otp);

    const record = await this.otpRepository.findLatestByPhone(phone);
    if (record) {
      await this.otpRepository.markUsed(record.id);
    }
  }

  private randomOtp(): string {
    const length = this.configService.getOrThrow('auth.otpLength', {
      infer: true,
    });
    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;
    return String(randomInt(min, max + 1));
  }
}
