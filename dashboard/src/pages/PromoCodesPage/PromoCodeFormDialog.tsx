import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Tag, Percent, DollarSign, CalendarRange } from "lucide-react";

import type { AdminPromoCode } from "@/lib/promoCodesApi";
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

const promoCodeSchema = z
  .object({
    code: z
      .string()
      .min(1, "Promo code is required")
      .max(20, "Max 20 characters")
      .regex(/^[A-Z0-9]+$/, "Uppercase letters and numbers only"),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().min(1, "Must be at least 1"),
    validFrom: z.string().min(1, "Valid from is required"),
    validUntil: z.string().min(1, "Valid until is required"),
    isActive: z.boolean(),
  })
  .refine((v) => v.discountType !== "percentage" || v.discountValue <= 100, {
    message: "Percentage discount cannot exceed 100",
    path: ["discountValue"],
  })
  .refine((v) => v.discountType !== "fixed" || v.discountValue <= 5000, {
    message: "Fixed discount cannot exceed 5000 KWD",
    path: ["discountValue"],
  })
  .refine((v) => v.validUntil > v.validFrom, {
    message: "Must be after Valid From",
    path: ["validUntil"],
  });

export type PromoCodeFormValues = z.infer<typeof promoCodeSchema>;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysIso(days: number) {
  const d = new Date();

  d.setDate(d.getDate() + days);

  return d.toISOString().slice(0, 10);
}

function emptyValues(): PromoCodeFormValues {
  return {
    code: "",
    discountType: "percentage",
    discountValue: 0,
    validFrom: todayIso(),
    validUntil: plusDaysIso(30),
    isActive: true,
  };
}

const inputCls = "h-10";
const labelRowCls = "flex items-center gap-1.5 mb-1.5";

export interface PromoCodeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a promo code to edit it; omit/null to add a new one. Same dialog handles both. */
  promoCode?: AdminPromoCode | null;
  onSubmit: (values: PromoCodeFormValues, editingId: string | null) => void;
}

export default function PromoCodeFormDialog({
  open,
  onOpenChange,
  promoCode,
  onSubmit,
}: PromoCodeFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!promoCode;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PromoCodeFormValues>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: emptyValues(),
  });

  // Re-seed the form whenever a different promo code is opened for edit (or the dialog reopens in add mode).
  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      promoCode
        ? {
            code: promoCode.code,
            discountType: promoCode.discountType,
            discountValue: promoCode.discountValue,
            validFrom: promoCode.validFrom.slice(0, 10),
            validUntil: promoCode.validUntil.slice(0, 10),
            isActive: promoCode.isActive,
          }
        : emptyValues()
    );
  }, [open, promoCode, reset]);

  const discountType = watch("discountType");

  function submit(values: PromoCodeFormValues) {
    onSubmit({ ...values, code: isEdit ? promoCode!.code : values.code }, promoCode?.id ?? null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl min-h-[420px] max-h-[85vh]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>
              {isEdit ? t("promoCodes.dialog.editTitle") : t("promoCodes.dialog.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t("promoCodes.dialog.editDescription", { code: promoCode!.code })
                : t("promoCodes.dialog.createDescription")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-5">
            {/* Promo Code */}
            <div>
              <Label className={labelRowCls}>
                {t("promoCodes.dialog.code")} <span className="text-destructive">*</span>
              </Label>
              <Input
                className={inputCls}
                placeholder={t("promoCodes.dialog.codePlaceholder")}
                maxLength={20}
                disabled={isEdit}
                {...register("code", {
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("promoCodes.dialog.codeHint")}
              </p>
              {errors.code && (
                <p className="text-xs text-destructive mt-1">{errors.code.message}</p>
              )}
            </div>

            {/* Discount Type + Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  {t("promoCodes.dialog.discountType")} <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-4 h-10 items-center">
                  <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      value="percentage"
                      className="accent-primary"
                      {...register("discountType")}
                    />
                    <Percent className="w-3.5 h-3.5 text-muted-foreground" />
                    {t("promoCodes.dialog.percentage")}
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      value="fixed"
                      className="accent-primary"
                      {...register("discountType")}
                    />
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                    {t("promoCodes.dialog.fixedAmount")}
                  </label>
                </div>
              </div>

              <div>
                <Label className={labelRowCls}>
                  {t("promoCodes.dialog.discountValue")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  type="number"
                  min={1}
                  max={discountType === "percentage" ? 100 : 5000}
                  placeholder={discountType === "percentage" ? "20" : "100"}
                  {...register("discountValue", { valueAsNumber: true })}
                />
                {errors.discountValue && (
                  <p className="text-xs text-destructive mt-1">{errors.discountValue.message}</p>
                )}
              </div>
            </div>

            {/* Validity Period */}
            <div>
              <Label className={labelRowCls}>
                <CalendarRange className="w-3.5 h-3.5 text-primary" />
                {t("promoCodes.dialog.validityPeriod")}
              </Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className={labelRowCls}>{t("promoCodes.dialog.validFrom")}</Label>
                  <Input className={inputCls} type="date" {...register("validFrom")} />
                </div>
                <div>
                  <Label className={labelRowCls}>{t("promoCodes.dialog.validUntil")}</Label>
                  <Input className={inputCls} type="date" {...register("validUntil")} />
                  {errors.validUntil && (
                    <p className="text-xs text-destructive mt-1">{errors.validUntil.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <Label className={labelRowCls + " mb-0"}>{t("promoCodes.dialog.isActive")}</Label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={watch("isActive")}
                  onChange={(e) => setValue("isActive", e.target.checked)}
                />
                <div className="w-11 h-6 bg-muted peer-checked:bg-primary rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("promoCodes.dialog.cancel")}
            </Button>
            <Button type="submit">{t("promoCodes.dialog.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
