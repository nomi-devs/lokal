import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Package, Check } from "lucide-react";

import type { Order, OrderStatus } from "@/data/orders";
import { Button } from "@/components/ui/button";
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

// Full timeline for the visual progress display — admin/dispatch owns everything from
// "in_transit" onward, so the editable <select> below only offers steps up to "ready_for_pickup".
const ORDER_TIMELINE: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "in_transit",
  "delivered",
];

const VENDOR_ALLOWED_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
];

export interface VendorOrderDetail {
  order: Order;
  status: OrderStatus;
  amount: number;
  customerName: string;
  customerEmail: string;
}

export interface VendorOrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: VendorOrderDetail | null;
  onSave: (orderId: number, status: OrderStatus) => void;
}

const selectCls =
  "h-10 w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring";

export default function VendorOrderStatusDialog({
  open,
  onOpenChange,
  detail,
  onSave,
}: VendorOrderStatusDialogProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<OrderStatus>("pending");

  useEffect(() => {
    if (open && detail) {
      setStatus(detail.status);
    }
  }, [open, detail]);

  if (!detail) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0" />
      </Dialog>
    );
  }

  const { order } = detail;
  const currentIdx = ORDER_TIMELINE.indexOf(detail.status);

  const isLocked =
    detail.status !== "cancelled" && !VENDOR_ALLOWED_STATUSES.includes(detail.status);

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
            <DialogDescription>{detail.customerName}</DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          {/* Timeline */}
          {detail.status !== "cancelled" && (
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

          {/* Items (brief) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Package className="w-4 h-4" />
              {t("vendor.orders.details.items", { count: order.items.length })}
            </div>
            <div className="border rounded-lg divide-y">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <p>
                    {item.productNameEn}
                    <span className="text-muted-foreground">
                      {" "}
                      · {t("vendor.orders.details.qty", { qty: item.qty })}
                    </span>
                  </p>
                  <span className="font-medium">
                    {(item.qty * item.price).toLocaleString()} KWD
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-base font-bold pt-2 border-t">
            <span>{t("vendor.orders.details.yourTotal")}</span>
            <span>{detail.amount.toLocaleString()} KWD</span>
          </div>

          {/* Status update */}
          {detail.status !== "cancelled" && isLocked && (
            <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
              {t("vendor.orders.details.statusLockedNote")}
            </div>
          )}
          {detail.status !== "cancelled" && !isLocked && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("vendor.orders.details.updateStatus")}
              </label>
              <select
                className={selectCls}
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
              >
                {VENDOR_ALLOWED_STATUSES.map((step) => (
                  <option key={step} value={step}>
                    {t(`common.status.${step}`, step)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </DialogBody>

        {detail.status !== "cancelled" && !isLocked && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("vendor.products.dialog.close")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onSave(order.id, status);
                onOpenChange(false);
              }}
            >
              {t("vendor.orders.details.save")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
