import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";

import type { AdminRefund } from "@/lib/refundsApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogBody, DialogFooter } from "@/components/ui/dialog";
import DialogIconHeader from "@/components/ui/DialogIconHeader";

const rejectSchema = z.object({
  reasonCategory: z.string(),
  reason: z.string().min(1, "Rejection reason is required").max(500, "Max 500 characters"),
});
type RejectValues = z.infer<typeof rejectSchema>;

const labelRowCls = "flex items-center gap-1.5 mb-1.5";

const REASON_CATEGORIES = [
  "warranty",
  "returnWindow",
  "customerDamage",
  "bankDetails",
  "other",
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refund: AdminRefund | null;
  onReject: (refundId: string, reason: string, category: string) => void;
}

export default function RefundRejectDialog({ open, onOpenChange, refund, onReject }: Props) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reasonCategory: "", reason: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ reasonCategory: "", reason: "" });
    }
  }, [open, refund, reset]);

  if (!refund) {
    return null;
  }

  function submit(values: RejectValues) {
    onReject(refund!.id, values.reason, values.reasonCategory);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md min-h-[320px] max-h-[70vh]">
        <DialogIconHeader
          icon={XCircle}
          title={t("refunds.rejectDialog.title")}
          description={t("refunds.rejectDialog.description", { orderId: refund.orderNumber })}
        />

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            <div>
              <Label className={labelRowCls}>{t("refunds.rejectDialog.reasonCategory")}</Label>
              <Select
                value={watch("reasonCategory")}
                onChange={(e) => setValue("reasonCategory", e.target.value)}
              >
                <option value="">{t("refunds.rejectDialog.reasonCategory")}</option>
                {REASON_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t(`refunds.rejectDialog.categories.${category}`)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label className={labelRowCls}>
                {t("refunds.rejectDialog.reason")} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder={t("refunds.rejectDialog.reasonPlaceholder")}
                maxLength={500}
                {...register("reason")}
              />
              {errors.reason && (
                <p className="text-xs text-destructive mt-1">{errors.reason.message}</p>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit" variant="destructive">
              <XCircle className="w-4 h-4" />
              {t("refunds.reject")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
