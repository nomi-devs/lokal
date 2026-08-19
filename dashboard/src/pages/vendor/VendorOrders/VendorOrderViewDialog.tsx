import { useTranslation } from "react-i18next";
import { ShoppingCart, User, MapPin, Package, CreditCard, Phone, Mail } from "lucide-react";

import type { VendorOrderDetail } from "./VendorOrderStatusDialog";

import type { OrderStatus } from "@/data/orders";
import { payments } from "@/data/payments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface VendorOrderViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: VendorOrderDetail | null;
}

const statusStyle: Record<OrderStatus, { text: string; bg: string }> = {
  pending: { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  confirmed: { text: "text-sky-700 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-900/30" },
  preparing: {
    text: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  ready_for_pickup: {
    text: "text-fuchsia-700 dark:text-fuchsia-400",
    bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
  },
  in_transit: {
    text: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30",
  },
  delivered: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  cancelled: { text: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
};

const paymentStyle: Record<string, string> = {
  success: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  pending: "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  failed: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  refunded: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800",
};

function StatusPill({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  const s = statusStyle[status];

  return (
    <span
      className={cn("inline-flex text-xs font-semibold px-2.5 py-1 rounded-full", s.text, s.bg)}
    >
      {t(`common.status.${status}`, status)}
    </span>
  );
}

export default function VendorOrderViewDialog({
  open,
  onOpenChange,
  detail,
}: VendorOrderViewDialogProps) {
  const { t } = useTranslation();

  if (!detail) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0" />
      </Dialog>
    );
  }

  const { order } = detail;
  const payment = order.paymentId ? payments.find((p) => p.id === order.paymentId) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle>{order.orderNumber}</DialogTitle>
            <DialogDescription>
              {t("vendor.orders.details.placedOn", { date: order.createdAt })}
            </DialogDescription>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0 mr-6">
            <StatusPill status={order.status} />
            <span className="text-[11px] text-muted-foreground">
              {t("vendor.orders.details.yourStatus")}:{" "}
              {t(`common.status.${detail.status}`, detail.status)}
            </span>
          </div>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          {/* Customer */}
          <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <User className="w-4 h-4" />
              {t("vendor.orders.details.customer")}
            </div>
            <p className="text-sm">{detail.customerName}</p>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              {detail.customerEmail}
            </p>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              {order.shippingAddress.phone}
            </p>
          </div>

          {/* Shipping */}
          <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="w-4 h-4" />
              {t("vendor.orders.details.deliveryAddress")}
            </div>
            <p className="text-sm">{order.shippingAddress.name}</p>
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.country}
            </p>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Package className="w-4 h-4" />
              {t("vendor.orders.details.items", { count: order.items.length })}
            </div>
            <div className="border rounded-lg divide-y">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div>
                    <p>{item.productNameEn}</p>
                    <p className="text-xs text-muted-foreground" dir="rtl">
                      {item.productNameAr}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("vendor.orders.details.qty", { qty: item.qty })}
                      {item.size ? ` · ${item.size}` : ""}
                      {item.color ? ` · ${item.color}` : ""}
                    </p>
                  </div>
                  <span className="font-medium">
                    {(item.qty * item.price).toLocaleString()} KWD
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          {payment && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="w-4 h-4" />
                {t("vendor.orders.details.payment")}
              </div>
              <div className="border rounded-lg p-3 grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">{t("payments.list.columns.method")}</span>
                <span className="text-right">
                  {t(`payments.method.${payment.method}`, payment.method)}
                </span>
                <span className="text-muted-foreground">{t("payments.list.columns.gateway")}</span>
                <span className="text-right">
                  {t(`payments.gateway.${payment.gateway}`, payment.gateway)}
                </span>
                <span className="text-muted-foreground">{t("payments.dialog.transactionId")}</span>
                <span className="text-right font-mono text-xs">{payment.transactionId}</span>
                <span className="text-muted-foreground">
                  {t("vendor.orders.details.paymentStatus")}
                </span>
                <span className="text-right">
                  <span
                    className={cn(
                      "inline-flex text-xs font-semibold px-2 py-0.5 rounded-full",
                      paymentStyle[payment.status]
                    )}
                  >
                    {t(`common.status.${payment.status}`, payment.status)}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Payment summary */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("vendor.orders.details.orderSubtotal")}
              </span>
              <span>{order.subtotal.toLocaleString()} KWD</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("vendor.orders.details.shippingFee")}
              </span>
              <span>{order.shippingFee.toLocaleString()} KWD</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("vendor.orders.details.orderTotal")}</span>
              <span>{order.total.toLocaleString()} KWD</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold pt-2 border-t">
              <span>{t("vendor.orders.details.yourTotal")}</span>
              <span>{detail.amount.toLocaleString()} KWD</span>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
