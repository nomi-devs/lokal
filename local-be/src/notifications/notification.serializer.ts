import { Notification } from './domain/notification';
import type { NotificationType } from './notifications.constants';

// The one place that decides what a notification "looks like" on the wire.
// GET /me/notifications and the FCM push payload are both built from this
// same object (see NotificationsService.dispatchPush and buildFcmData below)
// so the two channels can never drift into different shapes for the same
// event — a client that deep-links from `data` on a push tap gets exactly
// what it would have gotten from the list endpoint for that row.
export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  titleAr: string | null;
  body: string;
  bodyAr: string | null;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export function toNotificationPayload(
  notification: Notification,
): NotificationPayload {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    titleAr: notification.titleAr ?? null,
    body: notification.body,
    bodyAr: notification.bodyAr ?? null,
    data: notification.data ?? null,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}

// FCM's `data` payload must be a flat Record<string, string> — this is the
// only place that flattens a NotificationPayload for that transport, always
// built from toNotificationPayload() output rather than re-picking fields
// off the raw Notification.
export function buildFcmData(
  payload: NotificationPayload,
): Record<string, string> {
  const out: Record<string, string> = {
    id: payload.id,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    isRead: String(payload.isRead),
    data: payload.data ? JSON.stringify(payload.data) : '',
  };
  if (payload.titleAr) out.titleAr = payload.titleAr;
  if (payload.bodyAr) out.bodyAr = payload.bodyAr;
  return out;
}
