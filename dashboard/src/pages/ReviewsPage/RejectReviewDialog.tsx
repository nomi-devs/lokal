import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";

import type { AdminReview } from "@/lib/reviewsApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogBody, DialogFooter } from "@/components/ui/dialog";
import DialogIconHeader from "@/components/ui/DialogIconHeader";

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
      <DialogContent className="p-0 max-w-md min-h-[280px] max-h-[70vh]">
        <DialogIconHeader
          icon={XCircle}
          title={t("reviews.rejectDialog.title", "Reject review")}
          description={t("reviews.rejectDialog.description", { title: review.title.en })}
        />

        <DialogBody className="flex flex-col gap-3">
          <Label className="text-sm font-medium">
            {t("reviews.rejectDialog.reasonLabel", "Reason")}
          </Label>
          <Textarea
            placeholder={t("reviews.rejectDialog.reasonPlaceholder", "Why is this being rejected?")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
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
