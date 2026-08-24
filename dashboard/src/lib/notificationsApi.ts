import { apiClient } from "./apiClient";
import type { Pagination } from "./adminApi";

// Mirrors local-be's NotificationPayload (notifications/notification.serializer.ts)
// — the same shape the backend builds both the list response and the FCM push
// payload from, so this is the one true shape for a notification on the wire.
export interface NotificationRow {
  id: string;
  type: "order_update" | "promotion" | "new_order" | "admin_message";
  title: string;
  titleAr: string | null;
  body: string;
  bodyAr: string | null;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
}

export async function listNotifications(params: ListNotificationsParams = {}) {
  const { data } = await apiClient.get<{
    success: true;
    data: NotificationRow[];
    unreadCount: number;
    pagination: Pagination;
  }>("/me/notifications", { params: { page: 1, limit: 100, ...params } });

  return data;
}

export async function getUnreadCount() {
  const { data } = await apiClient.get<{ success: true; unreadCount: number }>(
    "/me/notifications/unread-count"
  );

  return data.unreadCount;
}

export async function markNotificationRead(id: string) {
  const { data } = await apiClient.patch<{ success: true; message: string }>(
    `/me/notifications/${id}/read`
  );

  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await apiClient.patch<{ success: true; message: string }>(
    "/me/notifications/read-all"
  );

  return data;
}

export async function updateNotificationSettings(enabled: boolean) {
  const { data } = await apiClient.patch<{ success: true; message: string }>(
    "/me/settings/notifications",
    { enabled }
  );

  return data;
}

export interface SendVendorNotificationPayload {
  // Omit to broadcast to every vendor account.
  vendorId?: string;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
}

export async function sendVendorNotification(payload: SendVendorNotificationPayload) {
  const { data } = await apiClient.post<{ success: true; message: string }>(
    "/admin/notifications/vendor",
    payload
  );

  return data;
}
