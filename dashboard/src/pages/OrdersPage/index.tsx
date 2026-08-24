import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, DollarSign, Clock, XCircle, Eye, MapPin, Package, Check, Truck } from "lucide-react";

import { ORDER_TIMELINE } from "./orderTimeline";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef, RowAction } from "@/components/ui/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { listAdminOrders, type Order, type OrderStatus } from "@/lib/ordersApi";
import { listUsers, listVendors, type AdminUserRow, type AdminVendorRow } from "@/lib/adminApi";
import { getApiErrorMessage } from "@/lib/apiClient";

// ── Style maps ────────────────────────────────────────────────────────────────
const statusStyle: Record<OrderStatus, { text: string; bg: string; dot: string }> = {
  placed: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    dot: "bg-amber-400",
  },
  confirmed: {
    text: "text-sky-700 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30",
    dot: "bg-sky-500",
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

const paymentStyle: Record<Order["paymentStatus"], string> = {
  paid: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  pending: "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  failed: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
};

// ── Order details drawer ──────────────────────────────────────────────────────
function OrderDetails({
  order,
  customerName,
  vendorName,
}: {
  order: Order;
  customerName: string;
  vendorName: string;
}) {
  const { t } = useTranslation();
  const currentIdx = ORDER_TIMELINE.indexOf(order.status);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
            statusStyle[order.status].text,
            statusStyle[order.status].bg
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle[order.status].dot)} />
          {t(`common.status.${order.status}`, order.status)}
        </span>
        <span
          className={cn(
            "inline-flex text-xs font-semibold px-2.5 py-1 rounded-full",
            paymentStyle[order.paymentStatus]
          )}
        >
          {t(`common.status.${order.paymentStatus}`, order.paymentStatus)}
        </span>
      </div>

      {/* Timeline */}
      {order.status !== "cancelled" && (
        <div className="flex items-center">
          {ORDER_TIMELINE.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    i <= currentIdx
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {i < currentIdx ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-xs">{i + 1}</span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground text-center w-14">
                  {t(`common.status.${step}`, step)}
                </span>
              </div>
              {i < ORDER_TIMELINE.length - 1 && (
                <div
                  className={cn("h-0.5 flex-1 mx-1", i < currentIdx ? "bg-primary" : "bg-muted")}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Customer + Store */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("orders.details.customer")}
          </span>
          <p className="text-sm">{customerName}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("orders.details.vendor")}
          </span>
          <p className="text-sm">{vendorName}</p>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="w-4 h-4" />
          {t("orders.details.deliveryAddress")}
        </div>
        <p className="text-sm text-muted-foreground">
          {order.addressSnapshot.addressLine}, {order.addressSnapshot.city}
          {order.addressSnapshot.country ? `, ${order.addressSnapshot.country}` : ""}
        </p>
      </div>

      {/* Driver */}
      {order.driver && (
        <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Truck className="w-4 h-4" />
            {t("orders.details.assignedRider")}
          </div>
          <p className="text-sm">{order.driver.name}</p>
          <p className="text-xs text-muted-foreground">{order.driver.phone}</p>
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Package className="w-4 h-4" />
          {t("orders.details.items", { count: order.items.length })}
        </div>
        <div className="border rounded-lg divide-y">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
              <div>
                <p>{item.name.en}</p>
                <p className="text-xs text-muted-foreground">
                  {t("orders.details.qty", { qty: item.qty })}
                  {item.size ? ` · ${item.size}` : ""}
                  {item.color ? ` · ${item.color}` : ""}
                </p>
              </div>
              <span className="font-medium">{(item.qty * item.unitPrice).toLocaleString()} KWD</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment summary */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("orders.columns.total")}</span>
          <span>
            {order.subtotal.toLocaleString()} + {order.deliveryFee} KWD
          </span>
        </div>
        <div className="flex items-center justify-between text-base font-bold pt-2 border-t">
          <span>{t("orders.details.total")}</span>
          <span>{order.total.toLocaleString()} KWD</span>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
// Admin is read-only on orders (see local-be's AdminOrdersController) — only
// the owning vendor can advance status/assign a driver, and only the
// customer can cancel, so this page has no status-edit/cancel actions.
export default function OrdersPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [usersById, setUsersById] = useState<Map<string, AdminUserRow>>(new Map());
  const [vendorsById, setVendorsById] = useState<Map<string, AdminVendorRow>>(new Map());
  const [selected, setSelected] = useState<Order | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes, vendorsRes] = await Promise.all([
        listAdminOrders({ limit: 200 }),
        listUsers({ limit: 200 }),
        listVendors({ limit: 200 }),
      ]);
      setOrderList(ordersRes.data);
      setUsersById(new Map(usersRes.data.map((u) => [u.id, u])));
      setVendorsById(new Map(vendorsRes.data.map((v) => [v.id, v])));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const customerName = useCallback(
    (o: Order) => {
      const u = usersById.get(o.customerId);
      return u ? `${u.firstName} ${u.lastName}`.trim() : "—";
    },
    [usersById]
  );
  const vendorName = useCallback(
    (o: Order) => vendorsById.get(o.storeId)?.storeName ?? "—",
    [vendorsById]
  );

  const pending = orderList.filter((o) => o.status === "placed").length;
  const cancelled = orderList.filter((o) => o.status === "cancelled").length;

  const revenue = useMemo(
    () => orderList.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0),
    [orderList]
  );

  const columns: ColumnDef<Order>[] = [
    {
      key: "orderNumber",
      header: t("orders.columns.order"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.orderNumber}</p>
          <p className="text-xs text-muted-foreground truncate">{vendorName(row)}</p>
        </div>
      ),
    },
    {
      key: "customerId",
      header: t("orders.columns.customer"),
      sortable: false,
      render: (_, row) => <span className="text-sm">{customerName(row)}</span>,
    },
    {
      key: "items",
      header: t("orders.columns.items"),
      sortable: false,
      align: "right",
      render: (v) => (v as Order["items"]).length,
    },
    {
      key: "total",
      header: t("orders.columns.total"),
      sortable: true,
      align: "right",
      render: (v) => <span className="font-semibold">{(v as number).toLocaleString()} KWD</span>,
    },
    {
      key: "status",
      header: t("orders.columns.status"),
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
    {
      key: "paymentStatus",
      header: t("orders.columns.payment"),
      sortable: false,
      render: (v) => (
        <span
          className={cn(
            "inline-flex text-xs font-semibold px-2 py-0.5 rounded-full",
            paymentStyle[v as Order["paymentStatus"]]
          )}
        >
          {t(`common.status.${v as string}`, v as string)}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t("orders.columns.date"),
      sortable: true,
      render: (v) => new Date(v as string).toLocaleDateString(),
    },
  ];

  const rowActions: RowAction<Order>[] = [
    { label: t("common.actions.viewDetails"), icon: Eye, onClick: setSelected },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("orders.topbarTitle")}>
      <DataTable<Order>
        title={t("orders.title")}
        description={t("orders.description")}
        data={orderList}
        columns={columns}
        rowKey="id"
        loading={loading}
        searchable
        searchPlaceholder={t("orders.searchPlaceholder")}
        searchKeys={["orderNumber"]}
        filters={[
          {
            key: "status",
            label: t("orders.filterStatus"),
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
        rowActionsVariant="inline"
        pagination={{ pageSize: 8, pageSizeOptions: [5, 8, 20] }}
        defaultSort={{ key: "createdAt", direction: "desc" }}
        striped
        stats={[
          {
            title: t("orders.stats.total"),
            value: orderList.length,
            icon: ShoppingCart,
            variant: "primary",
          },
          {
            title: t("orders.stats.revenue"),
            value: revenue.toLocaleString(),
            suffix: " KWD",
            icon: DollarSign,
            variant: "success",
          },
          { title: t("orders.stats.pending"), value: pending, icon: Clock, variant: "warning" },
          {
            title: t("orders.stats.cancelled"),
            value: cancelled,
            icon: XCircle,
            variant: "danger",
          },
        ]}
        emptyState={{
          title: t("orders.emptyTitle"),
          description: t("orders.emptyDescription"),
        }}
      />

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="p-0">
          {selected && (
            <>
              <DialogHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <DialogTitle>{selected.orderNumber}</DialogTitle>
                  <DialogDescription>
                    {t("orders.details.placedOn", {
                      date: new Date(selected.createdAt).toLocaleString(),
                    })}
                  </DialogDescription>
                </div>
              </DialogHeader>
              <DialogBody>
                <OrderDetails
                  order={selected}
                  customerName={customerName(selected)}
                  vendorName={vendorName(selected)}
                />
              </DialogBody>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
