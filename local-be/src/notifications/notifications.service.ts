import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { UsersService } from '../users/users.service';
import { PushService } from '../push/push.service';
import { Notification } from './domain/notification';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import { NotificationType } from './notifications.constants';
import {
  buildFcmData,
  NotificationPayload,
  toNotificationPayload,
} from './notification.serializer';

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  titleAr?: string;
  body: string;
  bodyAr?: string;
  data?: Record<string, unknown> | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly usersService: UsersService,
    private readonly pushService: PushService,
  ) {}

  // Creates the in-app record synchronously (the source of truth — always
  // written regardless of push outcome), then fires the push best-effort in
  // the background, same non-blocking `void` precedent as
  // OrdersService/EmailService. Never await this from a request handler that
  // shouldn't fail if push delivery does.
  async notify(
    userId: string,
    template: NotificationTemplate,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.create({
      userId,
      ...template,
    });
    void this.dispatchPush(userId, notification);
    return notification;
  }

  async notifyMany(
    userIds: string[],
    template: NotificationTemplate,
  ): Promise<Notification[]> {
    if (userIds.length === 0) return [];
    const notifications = await this.notificationRepository.createMany(
      userIds.map((userId) => ({ userId, ...template })),
    );
    for (const notification of notifications) {
      void this.dispatchPush(notification.userId, notification);
    }
    return notifications;
  }

  async findManyByUserId(
    userId: string,
    page: number,
    limit: number,
    status: 'all' | 'read' | 'unread' = 'all',
  ): Promise<{
    data: NotificationPayload[];
    unreadCount: number;
    total: number;
  }> {
    const [{ data, total }, unreadCount] = await Promise.all([
      this.notificationRepository.findManyByUserId(userId, page, limit, status),
      this.notificationRepository.countUnreadByUserId(userId),
    ]);
    // Same toNotificationPayload() used for the push data map (dispatchPush
    // below) — the list response and the push payload can never drift.
    return { data: data.map(toNotificationPayload), unreadCount, total };
  }

  countUnreadByUserId(userId: string): Promise<number> {
    return this.notificationRepository.countUnreadByUserId(userId);
  }

  async markRead(userId: string, id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new AppException(
        ERROR_CODES.NOTIFICATION_NOT_FOUND,
        'Notification not found',
        404,
      );
    }
    const updated = await this.notificationRepository.markRead(id);
    return updated as Notification;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllReadByUserId(userId);
  }

  private async dispatchPush(
    userId: string,
    notification: Notification,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.notificationsEnabled || user.fcmTokens.length === 0) {
      await this.notificationRepository.updatePushResult(notification.id, {
        pushStatus: 'skipped',
      });
      return;
    }

    // Both channels are built from the exact same payload — see
    // notification.serializer.ts.
    const payload = toNotificationPayload(notification);
    const result = await this.pushService.send(
      user.fcmTokens.map((t) => t.token),
      { title: payload.title, body: payload.body, data: buildFcmData(payload) },
    );

    await Promise.all(
      result.deadTokens.map((token) =>
        this.usersService.removeFcmTokenByToken(userId, token),
      ),
    );

    await this.notificationRepository.updatePushResult(notification.id, {
      pushStatus: result.successCount > 0 ? 'sent' : 'failed',
    });
  }
}
