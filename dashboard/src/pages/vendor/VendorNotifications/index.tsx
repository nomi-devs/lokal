import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Bell, BellOff, AlertTriangle, CheckCheck, Trash2, Eye } from "lucide-react";

import { getVendorNotifications, type VendorNotificationRow } from "../utils";

import { DashboardLayout } from "@/components/Dashboard";
import { vendorSidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import type { RootState } from "@/store";

const typeStyle: Record<VendorNotificationRow["type"], { text: string; bg: string }> = {
  Info: { text: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30" },
  Warning: { text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-900/30" },
  Alert: { text: "text-red-700 dark:text-red-300", bg: "bg-red-100 dark:bg-red-900/30" },
  System: { text: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-900/30" },
};

const priorityStyle: Record<VendorNotificationRow["priority"], { text: string; dot: string }> = {
  Normal: { text: "text-muted-foreground", dot: "bg-slate-400" },
  High: { text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-400" },
  Critical: { text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
};

export default function VendorNotifications() {
  const { t } = useTranslation();
  const vendorId = useSelector((state: RootState) => state.auth.user?.vendorId ?? 0);
  const [rows, setRows] = useState<VendorNotificationRow[]>(() => getVendorNotifications(vendorId));

  const title = (r: VendorNotificationRow) =>
    t(`vendor.notifications.templates.${r.kind}.title`, r.params);

  const message = (r: VendorNotificationRow) =>
    t(`vendor.notifications.templates.${r.kind}.message`, r.params);

  function markAsRead(row: VendorNotificationRow) {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, read: true } : r)));
  }

  function remove(row: VendorNotificationRow) {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    toast.success(t("vendor.notifications.toasts.deleted", { title: title(row) }));
  }

  const unread = rows.filter((r) => !r.read).length;
  const high = rows.filter((r) => r.priority === "High").length;
  const critical = rows.filter((r) => r.priority === "Critical").length;

  const columns: ColumnDef<VendorNotificationRow>[] = [
    {
      key: "kind",
      header: t("vendor.notifications.columns.notification"),
      render: (_, row) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={`text-sm truncate ${!row.read ? "font-semibold" : "font-medium"}`}>
            {!row.read && (
              <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 shrink-0" />
            )}
            {title(row)}
          </span>
          <span className="text-xs text-muted-foreground truncate">{message(row)}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: t("vendor.notifications.columns.type"),
      sortable: true,
      render: (v) => {
        const s = typeStyle[v as VendorNotificationRow["type"]];

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
      header: t("vendor.notifications.columns.priority"),
      sortable: true,
      render: (v) => {
        const s = priorityStyle[v as VendorNotificationRow["priority"]];

        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {t(`common.status.${(v as string).toLowerCase()}`, v as string)}
          </span>
        );
      },
    },
    { key: "sentAt", header: t("vendor.notifications.columns.received"), sortable: true },
    {
      key: "read",
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

  const rowActions: RowAction<VendorNotificationRow>[] = [
    {
      label: t("common.actions.view"),
      icon: Eye,
      onClick: (r) => toast.success(message(r), { title: title(r) }),
    },
    {
      label: t("common.actions.markAsRead"),
      icon: CheckCheck,
      onClick: markAsRead,
      hidden: (r) => r.read,
    },
    { label: t("common.actions.delete"), icon: Trash2, onClick: remove, variant: "destructive" },
  ];

  return (
    <DashboardLayout
      sidebarItems={vendorSidebarItems}
      topbarTitle={t("vendor.notifications.topbarTitle")}
    >
      <DataTable<VendorNotificationRow>
        title={t("vendor.notifications.title")}
        description={t("vendor.notifications.description")}
        data={rows}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder={t("vendor.notifications.searchPlaceholder")}
        filters={[
          {
            key: "type",
            label: t("vendor.notifications.filterType"),
            options: [
              { label: t("common.status.info"), value: "Info" },
              { label: t("common.status.warning"), value: "Warning" },
              { label: t("common.status.alert"), value: "Alert" },
              { label: t("common.status.system"), value: "System" },
            ],
          },
          {
            key: "read",
            label: t("vendor.notifications.filterStatus"),
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
            trend: { value: unread, label: t("notifications.stats.needAttention") },
          },
          {
            title: t("vendor.notifications.stats.high"),
            value: high,
            icon: AlertTriangle,
            variant: "warning",
          },
          {
            title: t("vendor.notifications.stats.critical"),
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
          title: t("vendor.notifications.emptyTitle"),
          description: t("vendor.notifications.emptyDescription"),
        }}
      />
    </DashboardLayout>
  );
}
