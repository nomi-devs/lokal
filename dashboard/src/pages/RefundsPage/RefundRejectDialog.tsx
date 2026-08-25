import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";

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

const rejectSchema = z.object({
  reasonCategory: z.string(),
  reason: z.string().min(1, "Rejection reason is required").max(500, "Max 500 characters"),
});
type RejectValues = z.infer<typeof rejectSchema>;

const labelRowCls = "flex items-center gap-1.5 mb-1.5";

const textareaCls = cn(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "min-h-24 resize-y"
);

const selectCls =
  "h-10 w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring";

const REASON_CATEGORIES = ["warranty", "returnWindow", "customerDamage", "bankDetails", "other"] as const;

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
      <DialogContent className="p-0 max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <div className="min-w-0">
            <DialogTitle>{t("refunds.rejectDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("refunds.rejectDialog.description", { orderId: refund.orderNumber })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            <div>
              <Label className={labelRowCls}>{t("refunds.rejectDialog.reasonCategory")}</Label>
              <select
                className={selectCls}
                value={watch("reasonCategory")}
                onChange={(e) => setValue("reasonCategory", e.target.value)}
              >
                <option value="">{t("refunds.rejectDialog.reasonCategory")}</option>
                {REASON_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t(`refunds.rejectDialog.categories.${category}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className={labelRowCls}>
                {t("refunds.rejectDialog.reason")} <span className="text-destructive">*</span>
              </Label>
              <textarea
                className={textareaCls}
                placeholder={t("refunds.rejectDialog.reasonPlaceholder")}
                maxLength={500}
                {...register("reason")}
              />
              {errors.reason && <p className="text-xs text-destructive mt-1">{errors.reason.message}</p>}
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
