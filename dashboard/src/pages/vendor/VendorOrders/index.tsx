import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ShoppingCart, DollarSign, Clock, Eye, Pencil } from "lucide-react";

import { getVendorOrders } from "../utils";

import VendorOrderStatusDialog, { type VendorOrderDetail } from "./VendorOrderStatusDialog";
import VendorOrderViewDialog from "./VendorOrderViewDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { vendorSidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { RootState } from "@/store";
import type { Order, OrderStatus } from "@/data/orders";
import { users } from "@/data/users";

const userById = new Map(users.map((u) => [u.id, u]));

const customerName = (userId: number) => {
  const u = userById.get(userId);

  return u ? `${u.firstName} ${u.lastName}`.trim() : "—";
};
const customerEmail = (userId: number) => userById.get(userId)?.email ?? "—";

type VendorOrderTableRow = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: number;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  order: Order;
};

const statusStyle: Record<OrderStatus, { text: string; bg: string; dot: string }> = {
  pending: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    dot: "bg-amber-400",
  },
  confirmed: {
    text: "text-sky-700 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30",
    dot: "bg-sky-500",
  },
  preparing: {
    text: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    dot: "bg-indigo-500",
  },
  ready_for_pickup: {
    text: "text-fuchsia-700 dark:text-fuchsia-400",
    bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
    dot: "bg-fuchsia-500",
  },
  in_transit: {
    text: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30",
    dot: "bg-violet-500",
  },
  delivered: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
  },
  cancelled: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
  },
};

export default function VendorOrders() {
  const { t } = useTranslation();
  const vendorId = useSelector((state: RootState) => state.auth.user?.vendorId ?? 0);

  const [rows, setRows] = useState<VendorOrderTableRow[]>(() =>
    getVendorOrders(vendorId).map((r) => ({
      id: r.order.id,
      orderNumber: r.order.orderNumber,
      customerName: customerName(r.order.userId),
      customerEmail: customerEmail(r.order.userId),
      items: r.order.items.length,
      amount: r.amount,
      status: r.status,
      createdAt: r.order.createdAt,
      order: r.order,
    }))
  );
  const [viewing, setViewing] = useState<VendorOrderTableRow | null>(null);
  const [editing, setEditing] = useState<VendorOrderTableRow | null>(null);

  const totalRevenue = rows
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + r.amount, 0);
  const pending = rows.filter((r) => r.status === "pending").length;

  function handleSaveStatus(orderId: number, status: OrderStatus) {
    setRows((prev) => prev.map((r) => (r.id === orderId ? { ...r, status } : r)));
    toast.success(
      t("vendor.orders.toasts.statusUpdated", {
        order: `#${orderId}`,
        status: t(`common.status.${status}`, status),
      })
    );
  }

  function toDetail(row: VendorOrderTableRow | null): VendorOrderDetail | null {
    return row
      ? {
          order: row.order,
          status: row.status,
          amount: row.amount,
          customerName: row.customerName,
          customerEmail: row.customerEmail,
        }
      : null;
  }

  const viewDetail = toDetail(viewing);
  const editDetail = toDetail(editing);

  const columns: ColumnDef<VendorOrderTableRow>[] = [
    {
      key: "orderNumber",
      header: t("vendor.orders.columns.order"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.orderNumber}</p>
          <p className="text-xs text-muted-foreground truncate">{row.customerName}</p>
        </div>
      ),
    },
    { key: "items", header: t("vendor.orders.columns.items"), align: "right" },
    {
      key: "amount",
      header: t("vendor.orders.columns.total"),
      sortable: true,
      align: "right",
      render: (v) => <span className="font-semibold">{(v as number).toLocaleString()} KWD</span>,
    },
    {
      key: "status",
      header: t("vendor.orders.columns.status"),
      sortable: true,
      render: (v) => {
        const s = statusStyle[v as OrderStatus];

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full",
              s.text,
              s.bg
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
            {t(`common.status.${v as string}`, v as string)}
          </span>
        );
      },
    },
    { key: "createdAt", header: t("vendor.orders.columns.date"), sortable: true },
  ];

  const rowActions: RowAction<VendorOrderTableRow>[] = [
    { label: t("common.actions.view"), icon: Eye, onClick: setViewing },
    {
      label: t("common.actions.edit"),
      icon: Pencil,
      onClick: setEditing,
      hidden: (r) => r.status === "cancelled" || r.status === "delivered",
    },
  ];

  return (
    <DashboardLayout sidebarItems={vendorSidebarItems} topbarTitle={t("vendor.orders.topbarTitle")}>
      <DataTable<VendorOrderTableRow>
        title={t("vendor.orders.title")}
        description={t("vendor.orders.description")}
        data={rows}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder={t("vendor.orders.searchPlaceholder")}
        searchKeys={["orderNumber", "customerName"]}
        filters={[
          {
            key: "status",
            label: t("vendor.orders.filterStatus"),
            options: [
              { label: t("common.status.pending"), value: "pending" },
              { label: t("common.status.confirmed"), value: "confirmed" },
              { label: t("common.status.preparing"), value: "preparing" },
              { label: t("common.status.ready_for_pickup"), value: "ready_for_pickup" },
              { label: t("common.status.in_transit"), value: "in_transit" },
              { label: t("common.status.delivered"), value: "delivered" },
              { label: t("common.status.cancelled"), value: "cancelled" },
            ],
          },
        ]}
        rowActions={rowActions}
        rowActionsVariant="inline"
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("vendor.orders.stats.total"),
            value: rows.length,
            icon: ShoppingCart,
            variant: "primary",
          },
          {
            title: t("vendor.orders.stats.revenue"),
            value: totalRevenue.toLocaleString(),
            suffix: " KWD",
            icon: DollarSign,
            variant: "success",
          },
          {
            title: t("vendor.orders.stats.pending"),
            value: pending,
            icon: Clock,
            variant: "warning",
          },
        ]}
        emptyState={{
          title: t("vendor.orders.emptyTitle"),
          description: t("vendor.orders.emptyDescription"),
        }}
      />

      <VendorOrderViewDialog
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        detail={viewDetail}
      />

      <VendorOrderStatusDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        detail={editDetail}
        onSave={handleSaveStatus}
      />
    </DashboardLayout>
  );
}
