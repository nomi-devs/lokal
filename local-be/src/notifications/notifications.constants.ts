// order_update: sent to a customer (checkout confirmed, status change, cancellation).
// new_order: sent to a vendor's user account when one of their orders is created.
// promotion: reserved for the future Content/banners module (no trigger source yet).
// admin_message: admin -> vendor broadcast, see AdminNotificationsController.
export const NOTIFICATION_TYPES = [
  'order_update',
  'promotion',
  'new_order',
  'admin_message',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const PUSH_STATUSES = ['sent', 'failed', 'skipped'] as const;
export type PushStatus = (typeof PUSH_STATUSES)[number];
