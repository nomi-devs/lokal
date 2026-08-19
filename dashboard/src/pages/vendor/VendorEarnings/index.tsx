import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Wallet, DollarSign, Percent, Landmark, Info } from "lucide-react";

import { getVendorOrders } from "../utils";

import { DashboardLayout } from "@/components/Dashboard";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import { vendorSidebarItems } from "@/constants";
import { cn } from "@/lib/utils";
import type { RootState } from "@/store";
import { initialVendors } from "@/data/vendors";

type PayoutStatus = "paid" | "pending";

type EarningsRow = {
  id: number;
  orderNumber: string;
  date: string;
  gross: number;
  commission: number;
  net: number;
  payoutStatus: PayoutStatus;
};

const payoutStyle: Record<PayoutStatus, { text: string; bg: string }> = {
  paid: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  pending: { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
};

export default function VendorEarnings() {
  const { t } = useTranslation();
  const vendorId = useSelector((state: RootState) => state.auth.user?.vendorId ?? 0);
  const vendor = initialVendors.find((v) => v.id === vendorId);
  const commission = vendor?.commission ?? { type: "percentage" as const, value: 0 };

  // Cancelled orders never earned anything, so they're excluded from the breakdown entirely.
  const rows: EarningsRow[] = getVendorOrders(vendorId)
    .filter((r) => r.status !== "cancelled")
    .map((r) => {
      const commissionAmount =
        commission.type === "percentage"
          ? r.amount * (commission.value / 100)
          : Math.min(commission.value, r.amount);

      return {
        id: r.order.id,
        orderNumber: r.order.orderNumber,
        date: r.order.createdAt,
        gross: r.amount,
        commission: commissionAmount,
        net: r.amount - commissionAmount,
        payoutStatus: r.status === "delivered" ? "paid" : ("pending" as PayoutStatus),
      };
    });

  const grossEarnings = rows.reduce((sum, r) => sum + r.gross, 0);
  const commissionDeducted = rows.reduce((sum, r) => sum + r.commission, 0);
  const netPayout = rows.reduce((sum, r) => sum + r.net, 0);

  const pendingPayout = rows
    .filter((r) => r.payoutStatus === "pending")
    .reduce((sum, r) => sum + r.net, 0);

  const commissionLabel =
    commission.type === "percentage" ? `${commission.value}%` : `${commission.value} KWD`;

  const columns: ColumnDef<EarningsRow>[] = [
    { key: "orderNumber", header: t("vendor.earnings.columns.order"), sortable: true },
    { key: "date", header: t("vendor.earnings.columns.date"), sortable: true },
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
      render: (v) => `-${(v as number).toFixed(2)} KWD`,
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
      <div className="flex flex-col gap-6">
        {/* Payout note */}
        {vendor?.bankAccount && (
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              {t("vendor.earnings.payoutNote", {
                bankName: vendor.bankAccount.bankName,
                accountNumber: vendor.bankAccount.accountNumber,
              })}
            </p>
          </div>
        )}

        <DataTable<EarningsRow>
          title={t("vendor.earnings.title")}
          description={t("vendor.earnings.description")}
          data={rows}
          columns={columns}
          rowKey="id"
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
              description: t("vendor.earnings.stats.commissionRateHint", { rate: commissionLabel }),
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
      </div>
    </DashboardLayout>
  );
}
