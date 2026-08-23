import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { AllConfigType } from '../config/config.type';

// Mirrors SmsService's shape: the OTP is always logged in non-prod so the
// flow is testable even without SMTP configured, and delivery through the
// real provider (SMTP here, via EMAIL_HOST/PORT/USER/PASSWORD) is best-effort
// — a gateway failure must never break the OTP flow, since the OTP is
// already stored server-side regardless of whether the email arrives.
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async sendOtp(email: string, otp: string): Promise<void> {
    const subject = 'Your Lokal Verification Code';
    const text = `Your Lokal verification code is ${otp}. It will expire in 5 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2c3e50;">Welcome to Lokal!</h2>
        <p>You're almost there! Use the verification code below to complete your registration:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Lokal Team</p>
      </div>
    `;
    await this.send(email, subject, text, html);
  }

  private async send(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    if (
      this.configService.get('app.nodeEnv', { infer: true }) !== 'production'
    ) {
      this.logger.log(`[DEV ONLY] Email to ${to} — ${subject}: ${text}`);
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      return;
    }

    try {
      await transporter.sendMail({
        from: this.configService.get('email.from', { infer: true }),
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${(error as Error).message}`,
      );
    }
  }

  private getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.configService.get('email.host', { infer: true });
    if (!host) {
      return null;
    }

    const port = this.configService.get('email.port', { infer: true }) ?? 587;
    this.transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: this.configService.get('email.user', { infer: true }),
        pass: this.configService.get('email.password', { infer: true }),
      },
    });

    return this.transporter;
  }
}
