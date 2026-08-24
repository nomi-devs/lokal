import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, BellOff, CheckCheck, Eye } from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationRow,
} from "@/lib/notificationsApi";

// ── Style maps ────────────────────────────────────────────────────────────────
const typeStyle: Record<NotificationRow["type"], { text: string; bg: string }> = {
  order_update: { text: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30" },
  new_order: {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  admin_message: {
    text: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-900/30",
  },
  promotion: {
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────
// Backed by GET /me/notifications — this is the admin account's own inbox,
// same endpoint every role reads (see local-be's NotificationsController).
// There's no delete endpoint on the backend, so unlike the old mock there's
// no "remove" row action here — only mark-as-read/mark-all-read.
export default function NotificationsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listNotifications();
      setNotifications(res.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unread = notifications.filter((n) => !n.isRead).length;

  async function markAsRead(row: NotificationRow) {
    try {
      await markNotificationRead(row.id);
      setNotifications((prev) => prev.map((n) => (n.id === row.id ? { ...n, isRead: true } : n)));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function markAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(t("notifications.toasts.allMarkedRead", "All notifications marked as read"));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  const columns: ColumnDef<NotificationRow>[] = [
    {
      key: "title",
      header: t("notifications.columns.notification"),
      sortable: true,
      render: (_, row) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={`text-sm truncate ${!row.isRead ? "font-semibold" : "font-medium"}`}>
            {!row.isRead && (
              <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 shrink-0" />
            )}
            {row.title}
          </span>
          <span className="text-xs text-muted-foreground truncate">{row.body}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: t("notifications.columns.type"),
      sortable: true,
      render: (v) => {
        const s = typeStyle[v as NotificationRow["type"]];

        return (
          <span
            className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${s.text} ${s.bg}`}
          >
            {t(`notifications.types.${v as string}`, v as string)}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: t("notifications.columns.received"),
      sortable: true,
      render: (v) => new Date(v as string).toLocaleString(),
    },
    {
      key: "isRead",
      header: t("notifications.columns.status"),
      sortable: true,
      render: (v) =>
        v ? (
          <span className="text-xs text-muted-foreground">{t("common.status.read")}</span>
        ) : (
          <span className="text-xs font-semibold text-primary">{t("common.status.unread")}</span>
        ),
    },
  ];

  const rowActions: RowAction<NotificationRow>[] = [
    {
      label: t("common.actions.view"),
      icon: Eye,
      onClick: (r) => toast.info(r.body, { title: r.title }),
    },
    {
      label: t("common.actions.markAsRead"),
      icon: CheckCheck,
      onClick: markAsRead,
      hidden: (r) => r.isRead,
    },
  ];

  const toolbarActions: ToolbarAction<NotificationRow>[] = [
    {
      label: t("notifications.markAllRead", "Mark all as read"),
      icon: CheckCheck,
      variant: "default",
      requiresSelection: false,
      onClick: markAllRead,
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("notifications.topbarTitle")}>
      <DataTable<NotificationRow>
        title={t("notifications.title")}
        description={t("notifications.description")}
        data={notifications}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("notifications.searchPlaceholder")}
        searchKeys={["title", "body"]}
        filters={[
          {
            key: "type",
            label: t("notifications.filterType"),
            options: [
              { label: t("notifications.types.order_update"), value: "order_update" },
              { label: t("notifications.types.new_order"), value: "new_order" },
              { label: t("notifications.types.admin_message"), value: "admin_message" },
              { label: t("notifications.types.promotion"), value: "promotion" },
            ],
          },
          {
            key: "isRead",
            label: t("notifications.filterStatus"),
            options: [
              { label: t("common.status.unread"), value: "false" },
              { label: t("common.status.read"), value: "true" },
            ],
          },
        ]}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        pagination={{ pageSize: 8 }}
        stats={[
          {
            title: t("notifications.stats.total"),
            value: notifications.length,
            icon: Bell,
            variant: "primary",
          },
          {
            title: t("notifications.stats.unread"),
            value: unread,
            icon: BellOff,
            variant: "info",
            trend: { value: unread, label: t("notifications.stats.needAttention") },
          },
        ]}
        emptyState={{
          title: t("notifications.emptyTitle"),
          description: t("notifications.emptyDescription"),
        }}
      />
    </DashboardLayout>
  );
}
