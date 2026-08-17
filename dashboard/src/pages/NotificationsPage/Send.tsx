import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Users, Bell, AlertTriangle } from "lucide-react";

import ComposeNotificationDialog, { type ComposeFormValues } from "./ComposeNotificationDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { sentHistory as initialSentHistory, type SentNotification } from "@/data/notifications";

const typeStyle: Record<string, string> = {
  Info: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30",
  Warning: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30",
  Alert: "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30",
  System: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800",
};

const recipientLabel: Record<ComposeFormValues["recipients"], string> = {
  all: "All Users",
  admins: "Admins",
  users: "Users",
  editors: "Editors",
};

export default function SendNotificationsPage() {
  const { t } = useTranslation();
  const [sentList, setSentList] = useState<SentNotification[]>(initialSentHistory);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleCompose(values: ComposeFormValues) {
    const nextId = Math.max(0, ...sentList.map((n) => n.id)) + 1;

    setSentList((prev) => [
      {
        id: nextId,
        title: values.title,
        recipients: recipientLabel[values.recipients],
        type: values.type,
        priority: values.priority,
        sentAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        delivered: 0,
      },
      ...prev,
    ]);
    toast.success(t("notificationsSend.compose.sentConfirmation"));
  }

  const columns: ColumnDef<SentNotification>[] = [
    {
      key: "title",
      header: t("notificationsSend.history.columns.title"),
      sortable: true,
      render: (v) => <span className="font-medium text-sm">{v as string}</span>,
    },
    {
      key: "recipients",
      header: t("notificationsSend.history.columns.recipients"),
      sortable: true,
    },
    {
      key: "type",
      header: t("notificationsSend.history.columns.type"),
      sortable: true,
      render: (v) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeStyle[v as string] ?? ""}`}
        >
          {t(`common.status.${(v as string).toLowerCase()}`, v as string)}
        </span>
      ),
    },
    {
      key: "priority",
      header: t("notificationsSend.history.columns.priority"),
      sortable: true,
      render: (v) => t(`common.status.${(v as string).toLowerCase()}`, v as string),
    },
    {
      key: "delivered",
      header: t("notificationsSend.history.columns.delivered"),
      sortable: true,
      align: "right",
      render: (v) => <span className="font-semibold">{(v as number).toLocaleString()}</span>,
    },
    { key: "sentAt", header: t("notificationsSend.history.columns.sentAt"), sortable: true },
  ];

  const toolbarActions: ToolbarAction<SentNotification>[] = [
    {
      label: t("notificationsSend.compose.submit"),
      icon: Send,
      variant: "default",
      requiresSelection: false,
      onClick: () => setDialogOpen(true),
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("notificationsSend.topbarTitle")}>
      <DataTable<SentNotification>
        title={t("notificationsSend.history.title")}
        description={t("notificationsSend.history.description")}
        data={sentList}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder={t("notificationsSend.history.searchPlaceholder")}
        searchKeys={["title", "recipients"]}
        filters={[
          {
            key: "type",
            label: t("notificationsSend.history.filterType"),
            options: [
              { label: t("common.status.info"), value: "Info" },
              { label: t("common.status.warning"), value: "Warning" },
              { label: t("common.status.alert"), value: "Alert" },
              { label: t("common.status.system"), value: "System" },
            ],
          },
          {
            key: "priority",
            label: t("notificationsSend.history.filterPriority"),
            options: [
              { label: t("common.status.normal"), value: "Normal" },
              { label: t("common.status.high"), value: "High" },
              { label: t("common.status.critical"), value: "Critical" },
            ],
          },
        ]}
        toolbarActions={toolbarActions}
        defaultSort={{ key: "sentAt", direction: "desc" }}
        pagination={{ pageSize: 5 }}
        stats={[
          {
            title: t("notificationsSend.history.stats.totalSent"),
            value: sentList.length,
            icon: Bell,
            variant: "primary",
          },
          {
            title: t("notificationsSend.history.stats.totalDelivered"),
            value: sentList.reduce((s, n) => s + n.delivered, 0).toLocaleString(),
            icon: Users,
            variant: "success",
          },
          {
            title: t("notificationsSend.history.stats.highPriority"),
            value: sentList.filter((n) => n.priority === "High").length,
            icon: AlertTriangle,
            variant: "warning",
          },
          {
            title: t("notificationsSend.history.stats.criticalSent"),
            value: sentList.filter((n) => n.priority === "Critical").length,
            icon: AlertTriangle,
            variant: "danger",
          },
        ]}
        emptyState={{ title: t("notificationsSend.history.emptyTitle") }}
      />

      <ComposeNotificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCompose}
      />
    </DashboardLayout>
  );
}
