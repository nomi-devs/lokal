import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, BellOff, Megaphone, ShoppingBag, CheckCheck, Eye } from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import { vendorSidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/lib/apiClient";
import * as notificationsApi from "@/lib/notificationsApi";
import type { NotificationRow } from "@/lib/notificationsApi";

const typeStyle: Record<NotificationRow["type"], { text: string; bg: string }> = {
  order_update: { text: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30" },
  new_order: {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  promotion: { text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-900/30" },
  admin_message: { text: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-900/30" },
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export default function VendorNotifications() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const resp = await notificationsApi.listNotifications();
      setRows(resp.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("vendor.notifications.toasts.loadFailed")));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const typeLabel = (type: NotificationRow["type"]) => t(`vendor.notifications.types.${type}`);

  async function markAsRead(row: NotificationRow) {
    try {
      await notificationsApi.markNotificationRead(row.id);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, isRead: true } : r)));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("vendor.notifications.toasts.actionFailed")));
    }
  }

  async function markAllAsRead() {
    try {
      await notificationsApi.markAllNotificationsRead();
      setRows((prev) => prev.map((r) => ({ ...r, isRead: true })));
      toast.success(t("vendor.notifications.toasts.allMarkedRead"));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("vendor.notifications.toasts.actionFailed")));
    }
  }

  const unread = rows.filter((r) => !r.isRead).length;
  const newOrders = rows.filter((r) => r.type === "new_order").length;
  const adminMessages = rows.filter((r) => r.type === "admin_message").length;

  const columns: ColumnDef<NotificationRow>[] = [
    {
      key: "title",
      header: t("vendor.notifications.columns.notification"),
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
      header: t("vendor.notifications.columns.type"),
      sortable: true,
      render: (v) => {
        const type = v as NotificationRow["type"];
        const s = typeStyle[type];

        return (
          <span
            className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${s.text} ${s.bg}`}
          >
            {typeLabel(type)}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: t("vendor.notifications.columns.received"),
      sortable: true,
      render: (v) => formatDateTime(v as string),
    },
    {
      key: "isRead",
      header: t("vendor.notifications.columns.status"),
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
      label: t("vendor.notifications.markAllRead"),
      icon: CheckCheck,
      requiresSelection: false,
      onClick: () => void markAllAsRead(),
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={vendorSidebarItems}
      topbarTitle={t("vendor.notifications.topbarTitle")}
    >
      <DataTable<NotificationRow>
        title={t("vendor.notifications.title")}
        description={t("vendor.notifications.description")}
        data={rows}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("vendor.notifications.searchPlaceholder")}
        searchKeys={["title", "body"]}
        filters={[
          {
            key: "type",
            label: t("vendor.notifications.filterType"),
            options: [
              { label: t("vendor.notifications.types.order_update"), value: "order_update" },
              { label: t("vendor.notifications.types.new_order"), value: "new_order" },
              { label: t("vendor.notifications.types.promotion"), value: "promotion" },
              { label: t("vendor.notifications.types.admin_message"), value: "admin_message" },
            ],
          },
          {
            key: "isRead",
            label: t("vendor.notifications.filterStatus"),
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
            title: t("vendor.notifications.stats.total"),
            value: rows.length,
            icon: Bell,
            variant: "primary",
          },
          {
            title: t("vendor.notifications.stats.unread"),
            value: unread,
            icon: BellOff,
            variant: "info",
          },
          {
            title: t("vendor.notifications.stats.newOrders"),
            value: newOrders,
            icon: ShoppingBag,
            variant: "success",
          },
          {
            title: t("vendor.notifications.stats.adminMessages"),
            value: adminMessages,
            icon: Megaphone,
            variant: "warning",
          },
        ]}
        emptyState={{
          title: t("vendor.notifications.emptyTitle"),
          description: t("vendor.notifications.emptyDescription"),
        }}
      />
    </DashboardLayout>
  );
}
