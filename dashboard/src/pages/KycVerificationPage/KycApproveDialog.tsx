import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CheckCircle2, User, Calendar } from "lucide-react";

import type { Vendor } from "@/data/vendors";
import type { RootState } from "@/store";
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

const labelRowCls = "flex items-center gap-1.5 mb-1.5";

const textareaCls = cn(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "min-h-24 resize-y"
);

const readonlyFieldCls =
  "h-10 flex items-center px-3 rounded-md border bg-muted/40 text-sm text-muted-foreground";

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  onApprove: (vendorId: number, notes: string, reviewedBy: string) => void;
}

export default function KycApproveDialog({ open, onOpenChange, vendor, onApprove }: Props) {
  const { t } = useTranslation();
  const user = useSelector((s: RootState) => s.auth.user);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setNotes("");
    }
  }, [open, vendor]);

  if (!vendor) {
    return null;
  }

  const reviewedBy = user ? titleCase(user.email.split("@")[0]) : "Admin";

  const approvalDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function submit() {
    onApprove(vendor!.id, notes, reviewedBy);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <DialogTitle>{t("kyc.approveDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("kyc.approveDialog.description", { name: vendor.nameEn })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div>
            <Label className={labelRowCls}>{t("kyc.approveDialog.notes")}</Label>
            <textarea
              className={textareaCls}
              placeholder={t("kyc.approveDialog.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={labelRowCls}>
                <User className="w-3.5 h-3.5 text-primary" />
                {t("kyc.approveDialog.reviewedBy")}
              </Label>
              <p className={readonlyFieldCls}>{reviewedBy}</p>
            </div>
            <div>
              <Label className={labelRowCls}>
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {t("kyc.approveDialog.approvalDate")}
              </Label>
              <p className={readonlyFieldCls}>{approvalDate}</p>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t("common.actions.cancel")}
          </Button>
          <Button
            type="button"
            onClick={submit}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t("kyc.approveDialog.button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
