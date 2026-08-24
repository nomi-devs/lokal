import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Wallet, DollarSign, Percent, Landmark } from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import { vendorSidebarItems } from "@/constants";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/lib/apiClient";
import { listVendorOrders } from "@/lib/ordersApi";

type PayoutStatus = "paid" | "pending";

type EarningsRow = {
  id: string;
  orderNumber: string;
  date: string;
  gross: number;
  commission: number;
  net: number;
  commissionPercent: number;
  payoutStatus: PayoutStatus;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
};

const payoutStyle: Record<PayoutStatus, { text: string; bg: string }> = {
  paid: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  pending: { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
};

// There's no payout/bank-account tracking in local-be yet — this reads
// straight off each order's own commissionPercentSnapshot (frozen at
// checkout time, see local-be's OrdersService.buildOrderDrafts), which is
// the source of truth for what was actually charged, not the vendor's
// current commission rate.
export default function VendorEarnings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<EarningsRow[]>([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listVendorOrders();
      const earningsRows: EarningsRow[] = res.data
        .filter((o) => o.status !== "cancelled")
        .map((o) => {
          const commission = o.total * (o.commissionPercentSnapshot / 100);

          return {
            id: o.id,
            orderNumber: o.orderNumber,
            date: o.createdAt,
            gross: o.total,
            commission,
            net: o.total - commission,
            commissionPercent: o.commissionPercentSnapshot,
            payoutStatus: o.status === "delivered" ? "paid" : ("pending" as PayoutStatus),
          };
        });
      setRows(earningsRows);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load earnings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const grossEarnings = rows.reduce((sum, r) => sum + r.gross, 0);
  const commissionDeducted = rows.reduce((sum, r) => sum + r.commission, 0);
  const netPayout = rows.reduce((sum, r) => sum + r.net, 0);

  const pendingPayout = rows
    .filter((r) => r.payoutStatus === "pending")
    .reduce((sum, r) => sum + r.net, 0);

  const columns: ColumnDef<EarningsRow>[] = [
    { key: "orderNumber", header: t("vendor.earnings.columns.order"), sortable: true },
    {
      key: "date",
      header: t("vendor.earnings.columns.date"),
      sortable: true,
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
    {
      key: "gross",
      header: t("vendor.earnings.columns.gross"),
      sortable: true,
      align: "right",
      render: (v) => `${(v as number).toLocaleString()} KWD`,
    },
    {
      key: "commission",
      header: t("vendor.earnings.columns.commission"),
      sortable: true,
      align: "right",
      render: (v, row) => `-${(v as number).toFixed(2)} KWD (${row.commissionPercent}%)`,
    },
    {
      key: "net",
      header: t("vendor.earnings.columns.net"),
      sortable: true,
      align: "right",
      render: (v) => <span className="font-semibold">{(v as number).toFixed(2)} KWD</span>,
    },
    {
      key: "payoutStatus",
      header: t("vendor.earnings.columns.payoutStatus"),
      sortable: true,
      render: (v) => {
        const s = payoutStyle[v as PayoutStatus];

        return (
          <span
            className={cn(
              "inline-flex text-xs font-semibold px-2 py-0.5 rounded-full",
              s.text,
              s.bg
            )}
          >
            {t(`vendor.earnings.payoutStatus.${v as string}`)}
          </span>
        );
      },
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={vendorSidebarItems}
      topbarTitle={t("vendor.earnings.topbarTitle")}
    >
      <DataTable<EarningsRow>
        title={t("vendor.earnings.title")}
        description={t("vendor.earnings.description")}
        data={rows}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("vendor.earnings.searchPlaceholder")}
        searchKeys={["orderNumber"]}
        filters={[
          {
            key: "payoutStatus",
            label: t("vendor.earnings.filterStatus"),
            options: [
              { label: t("vendor.earnings.payoutStatus.paid"), value: "paid" },
              { label: t("vendor.earnings.payoutStatus.pending"), value: "pending" },
            ],
          },
        ]}
        defaultSort={{ key: "date", direction: "desc" }}
        pagination={{ pageSize: 8 }}
        striped
        stats={[
          {
            title: t("vendor.earnings.stats.grossEarnings"),
            value: grossEarnings.toLocaleString(),
            suffix: " KWD",
            icon: DollarSign,
            variant: "primary",
          },
          {
            title: t("vendor.earnings.stats.commissionDeducted"),
            value: commissionDeducted.toFixed(2),
            suffix: " KWD",
            icon: Percent,
            variant: "warning",
          },
          {
            title: t("vendor.earnings.stats.netPayout"),
            value: netPayout.toFixed(2),
            suffix: " KWD",
            icon: Wallet,
            variant: "success",
          },
          {
            title: t("vendor.earnings.stats.pendingPayout"),
            value: pendingPayout.toFixed(2),
            suffix: " KWD",
            icon: Landmark,
            variant: "info",
          },
        ]}
        emptyState={{
          title: t("vendor.earnings.emptyTitle"),
          description: t("vendor.earnings.emptyDescription"),
        }}
      />
    </DashboardLayout>
  );
}
