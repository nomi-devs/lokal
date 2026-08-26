import { useTranslation } from "react-i18next";
import { ShoppingCart, User, MapPin, Package, CreditCard, Phone } from "lucide-react";

import type { Order, OrderStatus } from "@/lib/ordersApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Badge, { type BadgeVariant } from "@/components/ui/badge";

export interface VendorOrderViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

const statusVariant: Record<OrderStatus, BadgeVariant> = {
  placed: "warning",
  confirmed: "info",
  in_transit: "purple",
  delivered: "success",
  cancelled: "danger",
};

const paymentVariant: Record<Order["paymentStatus"], BadgeVariant> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
};

function StatusPill({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();

  return <Badge variant={statusVariant[status]}>{t(`common.status.${status}`, status)}</Badge>;
}

export default function VendorOrderViewDialog({
  open,
  onOpenChange,
  order,
}: VendorOrderViewDialogProps) {
  const { t } = useTranslation();

  if (!order) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0" />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl min-h-[420px] max-h-[85vh]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle>{order.orderNumber}</DialogTitle>
            <DialogDescription>
              {t("vendor.orders.details.placedOn", {
                date: new Date(order.createdAt).toLocaleString(),
              })}
            </DialogDescription>
          </div>
          <div className="shrink-0 mr-6">
            <StatusPill status={order.status} />
          </div>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          {/* Customer */}
          <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <User className="w-4 h-4" />
              {t("vendor.orders.details.customer")}
            </div>
            <p className="text-sm">{order.addressSnapshot.name}</p>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              {order.addressSnapshot.phone}
            </p>
          </div>

          {/* Shipping */}
          <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="w-4 h-4" />
              {t("vendor.orders.details.deliveryAddress")}
            </div>
            <p className="text-sm text-muted-foreground">
              {order.addressSnapshot.addressLine}, {order.addressSnapshot.city}
              {order.addressSnapshot.country ? `, ${order.addressSnapshot.country}` : ""}
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
                    <p>{item.name.en}</p>
                    {item.name.ar && (
                      <p className="text-xs text-muted-foreground" dir="rtl">
                        {item.name.ar}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t("vendor.orders.details.qty", { qty: item.qty })}
                      {item.size ? ` · ${item.size}` : ""}
                      {item.color ? ` · ${item.color}` : ""}
                    </p>
                  </div>
                  <span className="font-medium">
                    {(item.qty * item.unitPrice).toLocaleString()} KWD
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="w-4 h-4" />
              {t("vendor.orders.details.payment")}
            </div>
            <div className="border rounded-lg p-3 grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">{t("payments.list.columns.method")}</span>
              <span className="text-right">{order.paymentMethodType}</span>
              <span className="text-muted-foreground">
                {t("vendor.orders.details.paymentStatus")}
              </span>
              <span className="text-right">
                <Badge variant={paymentVariant[order.paymentStatus]}>
                  {t(`common.status.${order.paymentStatus}`, order.paymentStatus)}
                </Badge>
              </span>
            </div>
          </div>

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
              <span>{order.deliveryFee.toLocaleString()} KWD</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold pt-2 border-t">
              <span>{t("vendor.orders.details.orderTotal")}</span>
              <span>{order.total.toLocaleString()} KWD</span>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
