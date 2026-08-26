import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  // Returns the SMSBox URL that was (attempted to be) dispatched, password
  // redacted, so callers can echo it back for QA visibility (see
  // MobileAuthService.sendOtp) — returned in every environment, including
  // production, by deliberate product decision (unlike the raw `otp` field,
  // which stays dev/staging only). The message body embeds the OTP itself,
  // so treat this URL with the same care as the code.
  async sendOtp(phone: string, otp: string): Promise<{ smsUrl?: string }> {
    const message = `Your Lokal verification code is ${otp}`;
    const isProduction =
      this.configService.get('app.nodeEnv', { infer: true }) === 'production';

    if (!isProduction) {
      // Dev/staging fallback so the auth flow is testable end-to-end even
      // without SMS_BASE_URL configured.
      this.logger.log(`[DEV ONLY] OTP for ${phone}: ${otp}`);
    }

    const baseUrl = this.configService.get('sms.baseUrl', { infer: true });
    if (!baseUrl) {
      return {};
    }

    const params = this.buildParams(phone, message);

    return { smsUrl: `${baseUrl}${params.toString()}` };
  }

  // Confirmed SMSBox Http_SendSMS contract, e.g.:
  // https://smsbox.com/smsgateway/services/messaging.asmx/Http_SendSMS?username=...&password=...&customerid=...&sendertext=V+G+A&messagebody=...&recipientnumbers=%2B965...&defdate=&isblink=false&isflash=false
  // URLSearchParams handles the encoding: spaces in sendertext/messagebody
  // become "+", and the leading "+" on recipientnumbers becomes "%2B" —
  // don't strip it.
  private buildParams(phone: string, message: string): URLSearchParams {
    return new URLSearchParams({
      username: this.configService.get('sms.username', { infer: true }) ?? '',
      password: this.configService.get('sms.password', { infer: true }) ?? '',
      customerid:
        this.configService.get('sms.customerId', { infer: true }) ?? '',
      sendertext: this.configService.get('sms.sender', { infer: true }) ?? '',
      messagebody: message,
      recipientnumbers: phone,
      defdate: '',
      isblink: 'false',
      isflash: 'false',
    });
  }
}
