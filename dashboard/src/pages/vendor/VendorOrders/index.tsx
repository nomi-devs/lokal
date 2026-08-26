import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, DollarSign, Clock, Eye, Pencil } from "lucide-react";

import VendorOrderStatusDialog from "./VendorOrderStatusDialog";
import VendorOrderViewDialog from "./VendorOrderViewDialog";

import { DashboardLayout } from "@/components/Dashboard";
import { vendorSidebarItems } from "@/constants";
import { DataTable, renderDate, renderCurrency } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import { toast } from "@/components/ui/Toast";
import Badge, { type BadgeVariant } from "@/components/ui/badge";
import {
  listVendorOrders,
  updateVendorOrderStatus,
  type Order,
  type OrderStatus,
  type UpdateVendorOrderStatusPayload,
} from "@/lib/ordersApi";
import { getApiErrorMessage } from "@/lib/apiClient";
import { useListData } from "@/hooks/useListData";

const statusVariant: Record<OrderStatus, BadgeVariant> = {
  placed: "warning",
  confirmed: "info",
  in_transit: "purple",
  delivered: "success",
  cancelled: "danger",
};

export default function VendorOrders() {
  const { t } = useTranslation();

  const {
    data: orders,
    setData: setOrders,
    loading,
  } = useListData(async () => (await listVendorOrders()).data, [] as Order[], {
    fallbackMessage: "Failed to load orders",
  });
  const [viewing, setViewing] = useState<Order | null>(null);
  const [editing, setEditing] = useState<Order | null>(null);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === "placed").length;

  async function handleSaveStatus(orderId: string, payload: UpdateVendorOrderStatusPayload) {
    try {
      const updated = await updateVendorOrderStatus(orderId, payload);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast.success(
        t("vendor.orders.toasts.statusUpdated", {
          order: updated.orderNumber,
          status: t(`common.status.${payload.status}`, payload.status),
        })
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  const columns: ColumnDef<Order>[] = [
    {
      key: "orderNumber",
      header: t("vendor.orders.columns.order"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.orderNumber}</p>
          <p className="text-xs text-muted-foreground truncate">{row.addressSnapshot.name}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: t("vendor.orders.columns.items"),
      align: "right",
      render: (v) => (v as Order["items"]).length,
    },
    {
      key: "total",
      header: t("vendor.orders.columns.total"),
      sortable: true,
      align: "right",
      render: renderCurrency,
    },
    {
      key: "status",
      header: t("vendor.orders.columns.status"),
      sortable: true,
      render: (v) => (
        <Badge variant={statusVariant[v as OrderStatus]} dot>
          {t(`common.status.${v as string}`, v as string)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: t("vendor.orders.columns.date"),
      sortable: true,
      render: renderDate,
    },
  ];

  const rowActions: RowAction<Order>[] = [
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
      <DataTable<Order>
        title={t("vendor.orders.title")}
        description={t("vendor.orders.description")}
        data={orders}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("vendor.orders.searchPlaceholder")}
        searchKeys={["orderNumber"]}
        filters={[
          {
            key: "status",
            label: t("vendor.orders.filterStatus"),
            options: [
              { label: t("common.status.placed", "Placed"), value: "placed" },
              { label: t("common.status.confirmed"), value: "confirmed" },
              { label: t("common.status.in_transit"), value: "in_transit" },
              { label: t("common.status.delivered"), value: "delivered" },
              { label: t("common.status.cancelled"), value: "cancelled" },
            ],
          },
        ]}
        rowActions={rowActions}
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("vendor.orders.stats.total"),
            value: orders.length,
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
        order={viewing}
      />

      <VendorOrderStatusDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        order={editing}
        onSave={handleSaveStatus}
      />
    </DashboardLayout>
  );
}
