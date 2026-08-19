import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { CheckCircle2, User, Calendar, Link as LinkIcon } from "lucide-react";

import type { RefundRequest } from "@/data/refunds";
import type { RootState } from "@/store";
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
import { cn } from "@/lib/utils";

const approveSchema = z.object({
  proofOfTransferUrl: z.string().min(1, "Proof of transfer URL is required").url("Must be a valid URL"),
  approvalNotes: z.string().max(500, "Max 500 characters").optional(),
});
type ApproveValues = z.infer<typeof approveSchema>;

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
  refund: RefundRequest | null;
  onApprove: (refundId: string, proofOfTransferUrl: string, notes: string, reviewedBy: string) => void;
}

export default function RefundApproveDialog({ open, onOpenChange, refund, onApprove }: Props) {
  const { t } = useTranslation();
  const user = useSelector((s: RootState) => s.auth.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApproveValues>({
    resolver: zodResolver(approveSchema),
    defaultValues: { proofOfTransferUrl: "", approvalNotes: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ proofOfTransferUrl: "", approvalNotes: "" });
    }
  }, [open, refund, reset]);

  if (!refund) {
    return null;
  }

  const reviewedBy = user ? titleCase(user.email.split("@")[0]) : "Admin";

  const approvalDate = new Date().toLocaleString();

  function submit(values: ApproveValues) {
    onApprove(refund!.id, values.proofOfTransferUrl, values.approvalNotes ?? "", reviewedBy);
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
              {t("refunds.approveDialog.description", { orderId: refund.orderId })}
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
              <Input
                className="h-10"
                placeholder="https://…"
                {...register("proofOfTransferUrl")}
              />
              {errors.proofOfTransferUrl && (
                <p className="text-xs text-destructive mt-1">{errors.proofOfTransferUrl.message}</p>
              )}
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <User className="w-3.5 h-3.5 text-primary" />
                  {t("refunds.approveDialog.reviewedBy")}
                </Label>
                <p className={readonlyFieldCls}>{reviewedBy}</p>
              </div>
              <div>
                <Label className={labelRowCls}>
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {t("refunds.approveDialog.approvalDate")}
                </Label>
                <p className={readonlyFieldCls}>{approvalDate}</p>
              </div>
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
