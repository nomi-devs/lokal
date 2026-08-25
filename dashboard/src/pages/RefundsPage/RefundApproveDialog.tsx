import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

import type { AdminRefund } from "@/lib/refundsApi";
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

const approveSchema = z.object({
  approvalNotes: z.string().max(500, "Max 500 characters").optional(),
});
type ApproveValues = z.infer<typeof approveSchema>;

const labelRowCls = "flex items-center gap-1.5 mb-1.5";

const textareaCls = cn(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "min-h-24 resize-y"
);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refund: AdminRefund | null;
  onApprove: (refundId: string, approvalNotes: string) => void;
}

// First step of the two-step approval flow (see local-be's RefundsService —
// requested -> approved -> completed) — this only records the decision;
// the proof-of-transfer URL is collected separately once the transfer has
// actually happened, via RefundCompleteDialog.
export default function RefundApproveDialog({ open, onOpenChange, refund, onApprove }: Props) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApproveValues>({
    resolver: zodResolver(approveSchema),
    defaultValues: { approvalNotes: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ approvalNotes: "" });
    }
  }, [open, refund, reset]);

  if (!refund) {
    return null;
  }

  function submit(values: ApproveValues) {
    onApprove(refund!.id, values.approvalNotes ?? "");
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
            <DialogTitle>{t("refunds.approveDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("refunds.approveDialog.description", { orderId: refund.orderNumber })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            <div>
              <Label className={labelRowCls}>{t("refunds.approveDialog.notes")}</Label>
              <textarea
                className={textareaCls}
                placeholder={t("refunds.approveDialog.notesPlaceholder")}
                maxLength={500}
                {...register("approvalNotes")}
              />
              {errors.approvalNotes && (
                <p className="text-xs text-destructive mt-1">{errors.approvalNotes.message}</p>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              {t("refunds.approve")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
