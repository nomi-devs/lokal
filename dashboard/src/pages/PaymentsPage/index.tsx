import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import Badge, { type BadgeVariant } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/apiClient";
import { listAdminPayments, type AdminPaymentRow } from "@/lib/paymentsApi";

// ── Style maps ────────────────────────────────────────────────────────────────
const statusVariant: Record<AdminPaymentRow["paymentStatus"], BadgeVariant> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
};

// ── Page ──────────────────────────────────────────────────────────────────────
// Read-only reporting — a "payment" is just an order projected this way,
// not a separate collection you can add/edit/delete rows in (orders are
// only ever created after MyFatoorah confirms payment, so every row here is
// 'paid' today — see local-be's admin-payments.controller.ts).
export default function PaymentsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [paymentList, setPaymentList] = useState<AdminPaymentRow[]>([]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminPayments();
      setPaymentList(res.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load payments"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const successfulAmount = paymentList
    .filter((p) => p.paymentStatus === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = paymentList.filter((p) => p.paymentStatus === "pending").length;
  const failedCount = paymentList.filter((p) => p.paymentStatus === "failed").length;

  const columns: ColumnDef<AdminPaymentRow>[] = [
    {
      key: "orderNumber",
      header: t("payments.list.columns.order"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.orderNumber}</p>
          <p className="text-xs text-muted-foreground truncate">{row.vendorName}</p>
        </div>
      ),
    },
    {
      key: "customerName",
      header: t("payments.list.columns.customer"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm truncate">{row.customerName}</p>
          <p className="text-xs text-muted-foreground truncate">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: t("payments.list.columns.amount"),
      sortable: true,
      align: "right",
      render: (v) => <span className="font-semibold">{(v as number).toLocaleString()} KWD</span>,
    },
    {
      key: "paymentMethodType",
      header: t("payments.list.columns.method"),
      sortable: true,
    },
    {
      key: "paymentStatus",
      header: t("payments.list.columns.status"),
      sortable: true,
      render: (v) => (
        <Badge variant={statusVariant[v as AdminPaymentRow["paymentStatus"]]}>
          {t(`common.status.${v as string}`, v as string)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: t("payments.list.columns.date"),
      sortable: true,
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("payments.topbarTitle")}>
      <DataTable<AdminPaymentRow>
        title={t("payments.list.title")}
        description={t("payments.list.description")}
        data={paymentList}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("payments.list.searchPlaceholder")}
        searchKeys={["orderNumber", "customerName"]}
        filters={[
          {
            key: "paymentStatus",
            label: t("payments.list.filterStatus"),
            options: [
              { label: t("common.status.pending"), value: "pending" },
              { label: t("common.status.paid"), value: "paid" },
              { label: t("common.status.failed"), value: "failed" },
            ],
          },
        ]}
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("payments.list.stats.total"),
            value: paymentList.length,
            icon: CreditCard,
            variant: "primary",
          },
          {
            title: t("payments.list.stats.successful"),
            value: successfulAmount.toLocaleString(),
            suffix: " KWD",
            icon: CheckCircle2,
            variant: "success",
          },
          {
            title: t("payments.list.stats.pending"),
            value: pendingCount,
            icon: Clock,
            variant: "warning",
          },
          {
            title: t("payments.list.stats.failed"),
            value: failedCount,
            icon: XCircle,
            variant: "danger",
          },
        ]}
        emptyState={{
          title: t("payments.list.emptyTitle"),
          description: t("payments.list.emptyDescription"),
        }}
      />
    </DashboardLayout>
  );
}
