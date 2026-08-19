import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";

import type { Order } from "@/data/orders";
import { Button } from "@/components/ui/button";
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

const textareaCls = cn(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "min-h-24 resize-y"
);

export interface OrderCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onConfirm: (orderId: number, reason: string) => void;
}

export default function OrderCancelDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
}: OrderCancelDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!order) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0" />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <div className="min-w-0">
            <DialogTitle>
              {t("orders.cancelDialog.title", { order: order.orderNumber })}
            </DialogTitle>
            <DialogDescription>{t("orders.cancelDialog.description")}</DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-3">
          <Label className="text-sm font-medium">{t("orders.cancelDialog.reasonLabel")}</Label>
          <textarea
            className={textareaCls}
            placeholder={t("orders.cancelDialog.reasonPlaceholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("orders.cancelDialog.close")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm(order.id, reason.trim());
              onOpenChange(false);
            }}
          >
            {t("orders.cancelDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
