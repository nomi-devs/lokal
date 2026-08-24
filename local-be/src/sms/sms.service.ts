import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async sendOtp(phone: string, otp: string): Promise<void> {
    const message = `Your Lokal verification code is ${otp}`;

    if (
      this.configService.get('app.nodeEnv', { infer: true }) !== 'production'
    ) {
      // Dev/staging fallback so the auth flow is testable end-to-end even
      // without SMS_BASE_URL configured.
      this.logger.log(`[DEV ONLY] OTP for ${phone}: ${otp}`);
    }

    const baseUrl = this.configService.get('sms.baseUrl', { infer: true });
    if (!baseUrl) {
      return;
    }

    try {
      await this.dispatch(baseUrl, phone, message);
    } catch (error) {
      // Best-effort: a downstream gateway failure must never break the OTP
      // flow — the OTP is already stored and (outside production) logged above.
      this.logger.error(
        `Failed to send SMS to ${phone}: ${(error as Error).message}`,
      );
    }
  }

  // Confirmed SMSBox Http_SendSMS contract, e.g.:
  // https://smsbox.com/smsgateway/services/messaging.asmx/Http_SendSMS?username=...&password=...&customerid=...&sendertext=V+G+A&messagebody=...&recipientnumbers=%2B965...&defdate=&isblink=false&isflash=false
  // URLSearchParams handles the encoding: spaces in sendertext/messagebody
  // become "+", and the leading "+" on recipientnumbers becomes "%2B" —
  // don't strip it.
  private async dispatch(
    baseUrl: string,
    phone: string,
    message: string,
  ): Promise<void> {
    const params = new URLSearchParams({
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

    const url = `${baseUrl}${params.toString()}`;
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`SMSBox responded with status ${response.status}`);
    }
  }
}
