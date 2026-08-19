import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";

import type { Vendor } from "@/data/vendors";
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
  reasonPreset: z.string(),
  reason: z.string().min(1, "Rejection reason is required"),
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

const REASON_PRESETS = ["unclear", "expired", "invalidTax", "mismatch", "other"] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  onReject: (vendorId: number, reason: string) => void;
}

export default function KycRejectDialog({ open, onOpenChange, vendor, onReject }: Props) {
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
    defaultValues: { reasonPreset: "", reason: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ reasonPreset: "", reason: "" });
    }
  }, [open, vendor, reset]);

  if (!vendor) {
    return null;
  }

  function handlePresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const preset = e.target.value;
    setValue("reasonPreset", preset);

    if (preset && preset !== "other") {
      setValue("reason", t(`kyc.rejectDialog.reasons.${preset}`), { shouldValidate: true });
    } else if (preset === "other") {
      setValue("reason", "", { shouldValidate: true });
    }
  }

  function submit(values: RejectValues) {
    onReject(vendor!.id, values.reason);
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
            <DialogTitle>{t("kyc.rejectDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("kyc.rejectDialog.description", { name: vendor.nameEn })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            <div>
              <Label className={labelRowCls}>{t("kyc.rejectDialog.reasonPreset")}</Label>
              <select
                className={selectCls}
                value={watch("reasonPreset")}
                onChange={handlePresetChange}
              >
                <option value="">{t("kyc.rejectDialog.reasonPreset")}</option>
                {REASON_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {t(`kyc.rejectDialog.reasons.${preset}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className={labelRowCls}>
                {t("kyc.rejectDialog.reason")} <span className="text-destructive">*</span>
              </Label>
              <textarea
                className={textareaCls}
                placeholder={t("kyc.rejectDialog.reasonPlaceholder")}
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
              {t("kyc.rejectDialog.button")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
