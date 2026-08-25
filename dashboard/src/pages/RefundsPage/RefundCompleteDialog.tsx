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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
      <DialogContent className="p-0 max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <BadgeCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <DialogTitle>{t("refunds.completeDialog.title", "Mark as completed")}</DialogTitle>
            <DialogDescription>
              {t("refunds.completeDialog.description", {
                orderId: refund.orderNumber,
                defaultValue: "Confirm the bank transfer for order {{orderId}}",
              })}
            </DialogDescription>
          </div>
        </DialogHeader>

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
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
              <BadgeCheck className="w-4 h-4" />
              {t("refunds.completeDialog.confirm", "Mark completed")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
