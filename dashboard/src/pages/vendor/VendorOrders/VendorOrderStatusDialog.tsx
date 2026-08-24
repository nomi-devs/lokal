import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Package, Check, Truck } from "lucide-react";

import { ORDER_TIMELINE } from "../../OrdersPage/orderTimeline";

import type { Order, OrderDriver, UpdateVendorOrderStatusPayload } from "@/lib/ordersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Only these three are vendor-triggerable — 'placed' happens automatically
// at checkout and 'cancelled' is the customer's own action (see local-be's
// UpdateOrderStatusDto).
const VENDOR_ALLOWED_STATUSES: UpdateVendorOrderStatusPayload["status"][] = [
  "confirmed",
  "in_transit",
  "delivered",
];

export interface VendorOrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onSave: (orderId: string, payload: UpdateVendorOrderStatusPayload) => void;
}

const selectCls =
  "h-10 w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring";
const inputCls = "h-10";
const labelRowCls = "flex items-center gap-1.5 mb-1.5";

export default function VendorOrderStatusDialog({
  open,
  onOpenChange,
  order,
  onSave,
}: VendorOrderStatusDialogProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<UpdateVendorOrderStatusPayload["status"]>("confirmed");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  useEffect(() => {
    if (open && order) {
      setStatus(
        VENDOR_ALLOWED_STATUSES.includes(order.status as UpdateVendorOrderStatusPayload["status"])
          ? (order.status as UpdateVendorOrderStatusPayload["status"])
          : "confirmed"
      );
      setDriverName(order.driver?.name ?? "");
      setDriverPhone(order.driver?.phone ?? "");
    }
  }, [open, order]);

  if (!order) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0" />
      </Dialog>
    );
  }

  const currentIdx = ORDER_TIMELINE.indexOf(order.status);
  const isLocked = order.status === "delivered" || order.status === "cancelled";
  const showDriverFields = status === "in_transit" || status === "delivered";

  function handleSave() {
    const driver: OrderDriver | undefined = driverName.trim()
      ? { name: driverName.trim(), phone: driverPhone.trim() }
      : undefined;

    onSave(order!.id, { status, driver });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Pencil className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>
              {t("vendor.orders.details.editTitle", { order: order.orderNumber })}
            </DialogTitle>
            <DialogDescription>{order.addressSnapshot.name}</DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
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
                    <span className="text-[10px] text-muted-foreground text-center w-16">
                      {t(`common.status.${step}`, step)}
                    </span>
                  </div>
                  {i < ORDER_TIMELINE.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 mx-1",
                        i < currentIdx ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Package className="w-4 h-4" />
              {t("vendor.orders.details.items", { count: order.items.length })}
            </div>
            <div className="border rounded-lg divide-y">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <p>
                    {item.name.en}
                    <span className="text-muted-foreground">
                      {" "}
                      · {t("vendor.orders.details.qty", { qty: item.qty })}
                    </span>
                  </p>
                  <span className="font-medium">
                    {(item.qty * item.unitPrice).toLocaleString()} KWD
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-base font-bold pt-2 border-t">
            <span>{t("vendor.orders.details.yourTotal")}</span>
            <span>{order.total.toLocaleString()} KWD</span>
          </div>

          {isLocked ? (
            <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
              {t("vendor.orders.details.statusLockedNote")}
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {t("vendor.orders.details.updateStatus")}
                </label>
                <select
                  className={selectCls}
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as UpdateVendorOrderStatusPayload["status"])
                  }
                >
                  {VENDOR_ALLOWED_STATUSES.map((step) => (
                    <option key={step} value={step}>
                      {t(`common.status.${step}`, step)}
                    </option>
                  ))}
                </select>
              </div>

              {showDriverFields && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelRowCls}>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                        <Truck className="w-3.5 h-3.5 text-primary" />
                        {t("orders.statusDialog.riderName")}
                      </span>
                    </label>
                    <Input
                      className={inputCls}
                      placeholder={t("orders.statusDialog.riderNamePlaceholder")}
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelRowCls}>
                      <span className="text-sm font-medium">
                        {t("orders.statusDialog.riderPhone")}
                      </span>
                    </label>
                    <Input
                      className={inputCls}
                      placeholder={t("orders.statusDialog.riderPhonePlaceholder")}
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </DialogBody>

        {!isLocked && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("vendor.products.dialog.close")}
            </Button>
            <Button type="button" onClick={handleSave}>
              {t("vendor.orders.details.save")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
