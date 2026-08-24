import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { AllConfigType } from '../config/config.type';

export interface PushSendResult {
  successCount: number;
  failureCount: number;
  // Tokens FCM reports as permanently invalid — the caller (NotificationsService)
  // prunes these from the user's stored fcmTokens so retries don't keep hitting them.
  deadTokens: string[];
  error?: string;
}

// Mirrors SmsService/EmailService: best-effort, non-blocking, logs in dev,
// silently no-ops when Firebase credentials aren't configured — a push
// failure must never break the flow that triggered the notification, since
// the in-app Notification row is already persisted regardless.
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private app: App | null | undefined; // undefined = not yet resolved, null = unconfigured

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async send(
    tokens: string[],
    message: { title: string; body: string; data: Record<string, string> },
  ): Promise<PushSendResult> {
    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0, deadTokens: [] };
    }

    if (
      this.configService.get('app.nodeEnv', { infer: true }) !== 'production'
    ) {
      this.logger.log(
        `[DEV ONLY] Push to ${tokens.length} device(s) — ${message.title}: ${message.body}`,
      );
    }

    const app = this.getApp();
    if (!app) {
      return { successCount: 0, failureCount: 0, deadTokens: [] };
    }

    try {
      const result = await getMessaging(app).sendEachForMulticast({
        tokens,
        notification: { title: message.title, body: message.body },
        data: message.data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      });

      const deadTokens: string[] = [];
      result.responses.forEach((r, i) => {
        if (
          !r.success &&
          (r.error?.code === 'messaging/invalid-registration-token' ||
            r.error?.code === 'messaging/registration-token-not-registered')
        ) {
          deadTokens.push(tokens[i]);
        }
      });

      return {
        successCount: result.successCount,
        failureCount: result.failureCount,
        deadTokens,
      };
    } catch (error) {
      this.logger.error(`Failed to send push: ${(error as Error).message}`);
      return {
        successCount: 0,
        failureCount: tokens.length,
        deadTokens: [],
        error: (error as Error).message,
      };
    }
  }

  private getApp(): App | null {
    if (this.app !== undefined) {
      return this.app;
    }

    const projectId = this.configService.get('push.projectId', {
      infer: true,
    });
    const clientEmail = this.configService.get('push.clientEmail', {
      infer: true,
    });
    const privateKey = this.configService.get('push.privateKey', {
      infer: true,
    });
    if (!projectId || !clientEmail || !privateKey) {
      this.app = null;
      return null;
    }

    this.app =
      getApps()[0] ??
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    return this.app;
  }
}
