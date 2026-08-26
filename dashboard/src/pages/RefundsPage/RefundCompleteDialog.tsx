import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { BadgeCheck, Link as LinkIcon } from "lucide-react";

import type { AdminRefund } from "@/lib/refundsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogBody, DialogFooter } from "@/components/ui/dialog";
import DialogIconHeader from "@/components/ui/DialogIconHeader";

const completeSchema = z.object({
  proofOfTransferUrl: z
    .string()
    .min(1, "Proof of transfer URL is required")
    .url("Must be a valid URL"),
});
type CompleteValues = z.infer<typeof completeSchema>;

const labelRowCls = "flex items-center gap-1.5 mb-1.5";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refund: AdminRefund | null;
  onComplete: (refundId: string, proofOfTransferUrl: string) => void;
}

// Second step — only available once approved (see local-be's
// RefundsService.ALLOWED_TRANSITIONS: approved -> completed).
export default function RefundCompleteDialog({ open, onOpenChange, refund, onComplete }: Props) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompleteValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: { proofOfTransferUrl: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ proofOfTransferUrl: "" });
    }
  }, [open, refund, reset]);

  if (!refund) {
    return null;
  }

  function submit(values: CompleteValues) {
    onComplete(refund!.id, values.proofOfTransferUrl);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md min-h-[280px] max-h-[70vh]">
        <DialogIconHeader
          icon={BadgeCheck}
          variant="info"
          title={t("refunds.completeDialog.title", "Mark as completed")}
          description={t("refunds.completeDialog.description", {
            orderId: refund.orderNumber,
            defaultValue: "Confirm the bank transfer for order {{orderId}}",
          })}
        />

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            <div>
              <Label className={labelRowCls}>
                <LinkIcon className="w-3.5 h-3.5 text-primary" />
                {t("refunds.approveDialog.proofUrl")} <span className="text-destructive">*</span>
              </Label>
              <Input className="h-10" placeholder="https://…" {...register("proofOfTransferUrl")} />
              {errors.proofOfTransferUrl && (
                <p className="text-xs text-destructive mt-1">{errors.proofOfTransferUrl.message}</p>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit" variant="info">
              <BadgeCheck className="w-4 h-4" />
              {t("refunds.completeDialog.confirm", "Mark completed")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
