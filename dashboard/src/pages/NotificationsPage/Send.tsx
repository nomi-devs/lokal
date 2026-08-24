import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Bell } from "lucide-react";

import ComposeNotificationDialog, { type ComposeFormValues } from "./ComposeNotificationDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, ToolbarAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/lib/apiClient";
import * as adminApi from "@/lib/adminApi";
import type { AdminVendorRow } from "@/lib/adminApi";
import * as notificationsApi from "@/lib/notificationsApi";

// There's no backend endpoint to list past admin->vendor broadcasts (only to
// send one), so this table only tracks what was sent during this browser
// session — it resets on reload.
interface SentEntry {
  id: string;
  title: string;
  recipient: string;
  sentAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export default function SendNotificationsPage() {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<AdminVendorRow[]>([]);
  const [sentList, setSentList] = useState<SentEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    adminApi
      .listVendors()
      .then((resp) => setVendors(resp.data))
      .catch((error: unknown) =>
        toast.error(getApiErrorMessage(error, t("notificationsSend.toasts.loadVendorsFailed")))
      );
  }, [t]);

  async function handleCompose(values: ComposeFormValues) {
    const recipient = values.vendorId
      ? (vendors.find((v) => v.id === values.vendorId)?.storeName ?? values.vendorId)
      : t("notificationsSend.compose.allVendors");

    try {
      await notificationsApi.sendVendorNotification({
        vendorId: values.vendorId || undefined,
        title: values.title,
        titleAr: values.titleAr || undefined,
        message: values.message,
        messageAr: values.messageAr || undefined,
      });

      setSentList((prev) => [
        {
          id: `${Date.now()}`,
          title: values.title,
          recipient,
          sentAt: new Date().toLocaleString(),
        },
        ...prev,
      ]);
      toast.success(t("notificationsSend.compose.sentConfirmation"));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("notificationsSend.compose.sendFailed")));
    }
  }

  const columns: ColumnDef<SentEntry>[] = [
    {
      key: "title",
      header: t("notificationsSend.history.columns.title"),
      sortable: true,
      render: (v) => <span className="font-medium text-sm">{v as string}</span>,
    },
    {
      key: "recipient",
      header: t("notificationsSend.history.columns.recipient"),
      sortable: true,
    },
    { key: "sentAt", header: t("notificationsSend.history.columns.sentAt"), sortable: true },
  ];

  const toolbarActions: ToolbarAction<SentEntry>[] = [
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
      <DataTable<SentEntry>
        title={t("notificationsSend.history.title")}
        description={t("notificationsSend.history.description")}
        data={sentList}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder={t("notificationsSend.history.searchPlaceholder")}
        searchKeys={["title", "recipient"]}
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
        ]}
        emptyState={{ title: t("notificationsSend.history.emptyTitle") }}
      />

      <ComposeNotificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendors={vendors}
        onSubmit={handleCompose}
      />
    </DashboardLayout>
  );
}
