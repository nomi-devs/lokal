import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

const textareaCls = cn(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "min-h-20 resize-y"
);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: { id: string; storeName: string } | null;
  onSuspend: (vendorId: string, reason: string, duration?: number) => void;
}

export default function VendorSuspendDialog({ open, onOpenChange, vendor, onSuspend }: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setDuration("");
    }
  }, [open, vendor]);

  if (!vendor) {
    return null;
  }

  function submit() {
    if (!reason.trim()) {
      return;
    }

    onSuspend(vendor!.id, reason, duration ? Number(duration) : undefined);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md min-h-[320px] max-h-[70vh]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
            <ShieldOff className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="min-w-0">
            <DialogTitle>{t("vendors.suspendModal.title")}</DialogTitle>
            <DialogDescription>
              {t("vendors.suspendModal.description", { storeName: vendor.storeName })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block">
              {t("vendors.suspendModal.reasonLabel")} <span className="text-destructive">*</span>
            </Label>
            <textarea
              className={textareaCls}
              placeholder={t("vendors.suspendModal.reasonPlaceholder")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">{t("vendors.suspendModal.durationLabel")}</Label>
            <Input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t("vendors.suspendModal.cancel")}
          </Button>
          <Button type="button" variant="destructive" onClick={submit} disabled={!reason.trim()}>
            <ShieldOff className="w-4 h-4" />
            {t("vendors.suspendModal.suspend")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
