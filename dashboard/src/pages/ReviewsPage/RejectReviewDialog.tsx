import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";

import type { AdminReview } from "@/lib/reviewsApi";
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

export interface RejectReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: AdminReview | null;
  onConfirm: (reviewId: string, rejectionReason: string) => void;
}

export default function RejectReviewDialog({
  open,
  onOpenChange,
  review,
  onConfirm,
}: RejectReviewDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!review) {
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
            <DialogTitle>{t("reviews.rejectDialog.title", "Reject review")}</DialogTitle>
            <DialogDescription>
              {t("reviews.rejectDialog.description", { title: review.title.en })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-3">
          <Label className="text-sm font-medium">
            {t("reviews.rejectDialog.reasonLabel", "Reason")}
          </Label>
          <textarea
            className={textareaCls}
            placeholder={t("reviews.rejectDialog.reasonPlaceholder", "Why is this being rejected?")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.actions.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm(review.id, reason.trim());
              onOpenChange(false);
            }}
          >
            {t("reviews.reject", "Reject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
