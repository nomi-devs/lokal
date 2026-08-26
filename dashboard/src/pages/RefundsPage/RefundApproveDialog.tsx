import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

import type { AdminRefund } from "@/lib/refundsApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogBody, DialogFooter } from "@/components/ui/dialog";
import DialogIconHeader from "@/components/ui/DialogIconHeader";

const approveSchema = z.object({
  approvalNotes: z.string().max(500, "Max 500 characters").optional(),
});
type ApproveValues = z.infer<typeof approveSchema>;

const labelRowCls = "flex items-center gap-1.5 mb-1.5";

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
      <DialogContent className="p-0 max-w-md min-h-[280px] max-h-[70vh]">
        <DialogIconHeader
          icon={CheckCircle2}
          variant="success"
          title={t("refunds.approveDialog.title")}
          description={t("refunds.approveDialog.description", { orderId: refund.orderNumber })}
        />

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            <div>
              <Label className={labelRowCls}>{t("refunds.approveDialog.notes")}</Label>
              <Textarea
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
            <Button type="submit" variant="success">
              <CheckCircle2 className="w-4 h-4" />
              {t("refunds.approve")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
