import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, BellOff, AlertTriangle, CheckCheck, Trash2, Eye } from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { notifications as initialNotifications, type Notification } from "@/data/notifications";

// ── Style maps ────────────────────────────────────────────────────────────────
const typeStyle: Record<Notification["type"], { text: string; bg: string }> = {
  Info: { text: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30" },
  Warning: { text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-900/30" },
  Alert: { text: "text-red-700 dark:text-red-300", bg: "bg-red-100 dark:bg-red-900/30" },
  System: { text: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-900/30" },
};

const priorityStyle: Record<Notification["priority"], { text: string; dot: string }> = {
  Normal: { text: "text-muted-foreground", dot: "bg-slate-400" },
  High: { text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-400" },
  Critical: { text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoading();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unread = notifications.filter((n) => !n.read).length;
  const high = notifications.filter((n) => n.priority === "High").length;
  const critical = notifications.filter((n) => n.priority === "Critical").length;

  function markAsRead(row: Notification) {
    setNotifications((prev) => prev.map((n) => (n.id === row.id ? { ...n, read: true } : n)));
  }

  function remove(row: Notification) {
    setNotifications((prev) => prev.filter((n) => n.id !== row.id));
    toast.success(t("notifications.toasts.deleted", { title: row.title }));
  }

  const columns: ColumnDef<Notification>[] = [
    {
      key: "title",
      header: t("notifications.columns.notification"),
      sortable: true,
      render: (_, row) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={`text-sm truncate ${!row.read ? "font-semibold" : "font-medium"}`}>
            {!row.read && (
              <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 shrink-0" />
            )}
            {row.title}
          </span>
          <span className="text-xs text-muted-foreground truncate">{row.message}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: t("notifications.columns.type"),
      sortable: true,
      render: (v) => {
        const s = typeStyle[v as Notification["type"]];

        return (
          <span
            className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${s.text} ${s.bg}`}
          >
            {t(`common.status.${(v as string).toLowerCase()}`, v as string)}
          </span>
        );
      },
    },
    {
      key: "priority",
      header: t("notifications.columns.priority"),
      sortable: true,
      render: (v) => {
        const s = priorityStyle[v as Notification["priority"]];

        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {t(`common.status.${(v as string).toLowerCase()}`, v as string)}
          </span>
        );
      },
    },
    { key: "sentAt", header: t("notifications.columns.received"), sortable: true },
    {
      key: "read",
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

  const rowActions: RowAction<Notification>[] = [
    {
      label: t("common.actions.view"),
      icon: Eye,
      onClick: (r) => toast.info(r.message, { title: r.title }),
    },
    {
      label: t("common.actions.markAsRead"),
      icon: CheckCheck,
      onClick: markAsRead,
      hidden: (r) => r.read,
    },
    {
      label: t("common.actions.delete"),
      icon: Trash2,
      onClick: remove,
      variant: "destructive",
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("notifications.topbarTitle")}>
      <DataTable<Notification>
        title={t("notifications.title")}
        description={t("notifications.description")}
        data={notifications}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("notifications.searchPlaceholder")}
        searchKeys={["title", "message"]}
        filters={[
          {
            key: "type",
            label: t("notifications.filterType"),
            options: [
              { label: t("common.status.info"), value: "Info" },
              { label: t("common.status.warning"), value: "Warning" },
              { label: t("common.status.alert"), value: "Alert" },
              { label: t("common.status.system"), value: "System" },
            ],
          },
          {
            key: "priority",
            label: t("notifications.filterPriority"),
            options: [
              { label: t("common.status.normal"), value: "Normal" },
              { label: t("common.status.high"), value: "High" },
              { label: t("common.status.critical"), value: "Critical" },
            ],
          },
          {
            key: "read",
            label: t("notifications.filterStatus"),
            options: [
              { label: t("common.status.unread"), value: "false" },
              { label: t("common.status.read"), value: "true" },
            ],
          },
        ]}
        rowActions={rowActions}
        defaultSort={{ key: "sentAt", direction: "desc" }}
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
          {
            title: t("notifications.stats.high"),
            value: high,
            icon: AlertTriangle,
            variant: "warning",
          },
          {
            title: t("notifications.stats.critical"),
            value: critical,
            icon: AlertTriangle,
            variant: "danger",
            trend: {
              value: critical,
              label: t("notifications.stats.actionRequired"),
              positiveIsGood: false,
            },
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
