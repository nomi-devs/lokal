import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  DollarSign,
  Clock,
  XCircle,
  Eye,
  MapPin,
  User,
  CreditCard,
  Package,
  Check,
  Pencil,
  Truck,
  Ban,
} from "lucide-react";

import OrderStatusDialog from "./OrderStatusDialog";
import OrderCancelDialog from "./OrderCancelDialog";
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
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { orders as initialOrders, type Order, type OrderStatus } from "@/data/orders";
import { users } from "@/data/users";
import { initialVendors } from "@/data/vendors";
import { payments, type Payment, type PaymentStatus } from "@/data/payments";

const userById = new Map(users.map((u) => [u.id, u]));
const vendorById = new Map(initialVendors.map((v) => [v.id, v]));

const customerName = (o: Order) => {
  const u = userById.get(o.userId);

  return u ? `${u.firstName} ${u.lastName}`.trim() : "—";
};
const customerEmail = (o: Order) => userById.get(o.userId)?.email ?? "—";

const vendorNames = (o: Order) =>
  o.vendorOrders.map((vo) => vendorById.get(vo.vendorId)?.nameEn ?? "—").join(", ");

const orderPayment = (o: Order) =>
  o.paymentId ? payments.find((p) => p.id === o.paymentId) : undefined;

// ── Style maps ────────────────────────────────────────────────────────────────
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

const paymentStyle: Record<PaymentStatus, string> = {
  success: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  pending: "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  failed: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  refunded: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800",
};

// ── Order details drawer ──────────────────────────────────────────────────────
function OrderDetails({ order }: { order: Order }) {
  const { t } = useTranslation();
  const currentIdx = ORDER_TIMELINE.indexOf(order.status);
  const payment = orderPayment(order);

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
        {payment && (
          <span
            className={cn(
              "inline-flex text-xs font-semibold px-2.5 py-1 rounded-full",
              paymentStyle[payment.status]
            )}
          >
            {t(`common.status.${payment.status}`, payment.status)}
          </span>
        )}
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

      {/* Customer */}
      <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <User className="w-4 h-4" />
          {t("orders.details.customer")}
        </div>
        <p className="text-sm">{customerName(order)}</p>
        <p className="text-xs text-muted-foreground">{customerEmail(order)}</p>
      </div>

      {/* Shipping */}
      <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="w-4 h-4" />
          {t("orders.details.deliveryAddress")}
        </div>
        <p className="text-sm text-muted-foreground">
          {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.country}
        </p>
      </div>

      {/* Rider */}
      {order.assignedRider && (
        <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Truck className="w-4 h-4" />
            {t("orders.details.assignedRider")}
          </div>
          <p className="text-sm">{order.assignedRider.name}</p>
          <p className="text-xs text-muted-foreground">{order.assignedRider.phone}</p>
        </div>
      )}

      {/* Cancellation */}
      {order.status === "cancelled" && order.cancelReason && (
        <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <Ban className="w-4 h-4" />
            {t("orders.details.cancellation")}
          </div>
          <p className="text-sm text-muted-foreground">{order.cancelReason}</p>
          {order.cancelledBy && (
            <p className="text-xs text-muted-foreground">
              {t("orders.details.cancelledBy", {
                actor: t(`orders.cancelledByActor.${order.cancelledBy}`, order.cancelledBy),
              })}
            </p>
          )}
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
                <p>{item.productNameEn}</p>
                <p className="text-xs text-muted-foreground">
                  {t("orders.details.qty", { qty: item.qty })}
                  {item.size ? ` · ${item.size}` : ""}
                  {item.color ? ` · ${item.color}` : ""}
                </p>
              </div>
              <span className="font-medium">{(item.qty * item.price).toLocaleString()} KWD</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment summary */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CreditCard className="w-4 h-4" />
          {t("orders.details.paymentSummary")}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("orders.details.vendor")}</span>
          <span>{vendorNames(order)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("orders.columns.total")}</span>
          <span>
            {order.subtotal.toLocaleString()} + {order.shippingFee} KWD
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
export default function OrdersPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoading();
  const [orderList, setOrderList] = useState<Order[]>(initialOrders);
  const [selected, setSelected] = useState<Order | null>(null);
  const [statusTarget, setStatusTarget] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const pending = orderList.filter((o) => o.status === "pending").length;
  const cancelled = orderList.filter((o) => o.status === "cancelled").length;

  const revenue = useMemo(
    () => orderList.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0),
    [orderList]
  );

  function markPaymentRefunded(payment: Payment) {
    // Mutated in place on the shared array — PaymentsPage re-derives its own state on mount,
    // matching the mock-data convention used for review→rating sync elsewhere in the app.
    payment.status = "refunded";
    payment.updatedAt = new Date().toISOString();
  }

  function saveStatus(
    orderId: number,
    status: OrderStatus,
    rider?: { name: string; phone: string }
  ) {
    const now = new Date().toISOString();

    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              assignedRider: rider ?? o.assignedRider,
              updatedAt: now,
              deliveredAt: status === "delivered" ? now : o.deliveredAt,
            }
          : o
      )
    );
    toast.success(
      t("orders.statusDialog.toastBody", {
        order: orderList.find((o) => o.id === orderId)?.orderNumber ?? `#${orderId}`,
        status: t(`common.status.${status}`, status),
      }),
      { title: t("orders.statusDialog.toastTitle") }
    );
  }

  function confirmCancel(orderId: number, reason: string) {
    const now = new Date().toISOString();
    const order = orderList.find((o) => o.id === orderId);

    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "cancelled",
              cancelReason: reason,
              cancelledBy: "admin",
              cancelledAt: now,
              updatedAt: now,
              vendorOrders: o.vendorOrders.map((vo) => ({ ...vo, status: "cancelled" })),
            }
          : o
      )
    );

    const payment = order?.paymentId ? payments.find((p) => p.id === order.paymentId) : undefined;

    if (payment && payment.status === "success") {
      markPaymentRefunded(payment);
    }

    toast.error(
      t("orders.cancelDialog.toastBody", { order: order?.orderNumber ?? `#${orderId}` }),
      { title: t("orders.cancelDialog.toastTitle") }
    );
  }

  const columns: ColumnDef<Order>[] = [
    {
      key: "orderNumber",
      header: t("orders.columns.order"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.orderNumber}</p>
          <p className="text-xs text-muted-foreground truncate">{vendorNames(row)}</p>
        </div>
      ),
    },
    {
      key: "userId",
      header: t("orders.columns.customer"),
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm truncate">{customerName(row)}</p>
          <p className="text-xs text-muted-foreground truncate">{customerEmail(row)}</p>
        </div>
      ),
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
      key: "paymentId",
      header: t("orders.columns.payment"),
      sortable: false,
      render: (_, row) => {
        const payment = orderPayment(row);

        if (!payment) {
          return "—";
        }

        return (
          <span
            className={cn(
              "inline-flex text-xs font-semibold px-2 py-0.5 rounded-full",
              paymentStyle[payment.status]
            )}
          >
            {t(`common.status.${payment.status}`, payment.status)}
          </span>
        );
      },
    },
    { key: "createdAt", header: t("orders.columns.date"), sortable: true },
  ];

  const rowActions: RowAction<Order>[] = [
    { label: t("common.actions.viewDetails"), icon: Eye, onClick: setSelected },
    {
      label: t("orders.actions.updateStatus"),
      icon: Pencil,
      onClick: setStatusTarget,
      hidden: (r) => r.status === "cancelled",
    },
    {
      label: t("orders.actions.cancel"),
      icon: Ban,
      variant: "destructive",
      onClick: setCancelTarget,
      hidden: (r) => r.status === "cancelled" || r.status === "delivered",
    },
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
            trend: { value: 9.2, label: t("orders.stats.vsLastMonth") },
          },
          { title: t("orders.stats.pending"), value: pending, icon: Clock, variant: "warning" },
          {
            title: t("orders.stats.cancelled"),
            value: cancelled,
            icon: XCircle,
            variant: "danger",
            trend: { value: cancelled, label: t("orders.stats.orders"), positiveIsGood: false },
          },
        ]}
        emptyState={{
          title: t("orders.emptyTitle"),
          description: t("orders.emptyDescription"),
        }}
      />

      <OrderStatusDialog
        open={!!statusTarget}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        order={statusTarget}
        onSave={saveStatus}
      />

      <OrderCancelDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        order={cancelTarget}
        onConfirm={confirmCancel}
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
                    {t("orders.details.placedOn", { date: selected.createdAt })}
                  </DialogDescription>
                </div>
              </DialogHeader>
              <DialogBody>
                <OrderDetails order={selected} />
              </DialogBody>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
