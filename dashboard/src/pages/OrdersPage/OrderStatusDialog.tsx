import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Package, Check, Truck } from "lucide-react";

import { ORDER_TIMELINE } from "./orderTimeline";

import type { Order, OrderStatus } from "@/data/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const selectCls =
  "h-10 w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring";
const inputCls = "h-10";
const labelRowCls = "flex items-center gap-1.5 mb-1.5";

export interface OrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onSave: (orderId: number, status: OrderStatus, rider?: { name: string; phone: string }) => void;
}

export default function OrderStatusDialog({
  open,
  onOpenChange,
  order,
  onSave,
}: OrderStatusDialogProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");

  useEffect(() => {
    if (open && order) {
      setStatus(order.status === "cancelled" ? "pending" : order.status);
      setRiderName(order.assignedRider?.name ?? "");
      setRiderPhone(order.assignedRider?.phone ?? "");
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

  const showRiderFields =
    ORDER_TIMELINE.indexOf(status) >= ORDER_TIMELINE.indexOf("ready_for_pickup");

  function handleSave() {
    if (!order) {
      return;
    }

    const rider = riderName.trim()
      ? { name: riderName.trim(), phone: riderPhone.trim() }
      : undefined;

    onSave(order.id, status, rider);
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
              {t("orders.statusDialog.title", { order: order.orderNumber })}
            </DialogTitle>
            <DialogDescription>{t("orders.statusDialog.description")}</DialogDescription>
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
                    <span className="text-[10px] text-muted-foreground text-center w-14">
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
              {t("orders.details.items", { count: order.items.length })}
            </div>
            <div className="border rounded-lg divide-y">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <p>
                    {item.productNameEn}
                    <span className="text-muted-foreground">
                      {" "}
                      · {t("orders.details.qty", { qty: item.qty })}
                    </span>
                  </p>
                  <span className="font-medium">
                    {(item.qty * item.price).toLocaleString()} KWD
                  </span>
                </div>
              ))}
            </div>
          </div>

          {order.status === "cancelled" ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {t("orders.statusDialog.cancelledNote")}
            </div>
          ) : (
            <>
              <div>
                <Label className={labelRowCls}>{t("orders.statusDialog.newStatus")}</Label>
                <select
                  className={selectCls}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                >
                  {ORDER_TIMELINE.map((step) => (
                    <option key={step} value={step}>
                      {t(`common.status.${step}`, step)}
                    </option>
                  ))}
                </select>
              </div>

              {showRiderFields && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={labelRowCls}>
                      <Truck className="w-3.5 h-3.5 text-primary" />
                      {t("orders.statusDialog.riderName")}
                    </Label>
                    <Input
                      className={inputCls}
                      placeholder={t("orders.statusDialog.riderNamePlaceholder")}
                      value={riderName}
                      onChange={(e) => setRiderName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className={labelRowCls}>{t("orders.statusDialog.riderPhone")}</Label>
                    <Input
                      className={inputCls}
                      placeholder={t("orders.statusDialog.riderPhonePlaceholder")}
                      value={riderPhone}
                      onChange={(e) => setRiderPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("orders.statusDialog.close")}
          </Button>
          {order.status !== "cancelled" && (
            <Button type="button" onClick={handleSave}>
              {t("orders.statusDialog.save")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
