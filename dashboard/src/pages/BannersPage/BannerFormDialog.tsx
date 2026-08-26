import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, Link2, CalendarClock, Upload, Plus, Save } from "lucide-react";

import type { AdminBanner } from "@/lib/bannersApi";
import { uploadBannerImage } from "@/lib/bannersApi";
import { getApiErrorMessage } from "@/lib/apiClient";
import { toast } from "@/components/ui/Toast";
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

const bannerSchema = z.object({
  image: z.string().min(1, "Banner image is required"),
  titleEn: z.string().optional(),
  titleAr: z.string().optional(),
  url: z.string().optional(),
  order: z.number().int().min(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;

const emptyValues: BannerFormValues = {
  image: "",
  titleEn: "",
  titleAr: "",
  url: "",
  order: 0,
  startDate: "",
  endDate: "",
};

const inputCls = "h-10";
const labelRowCls = "flex items-center gap-1.5 mb-1.5";

export interface BannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a banner to edit it; omit/null to add a new one. Same dialog handles both. */
  banner?: AdminBanner | null;
  onSubmit: (values: BannerFormValues, editingId: string | null) => void;
}

export default function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  onSubmit,
}: BannerFormDialogProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isEdit = !!banner;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: emptyValues,
  });

  // Re-seed the form whenever a different banner is opened for edit (or the dialog reopens in add mode).
  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      banner
        ? {
            image: banner.imageUrl,
            titleEn: banner.titleEn ?? "",
            titleAr: banner.titleAr ?? "",
            url: banner.linkUrl ?? "",
            order: banner.sortOrder,
            startDate: banner.startDate ? banner.startDate.slice(0, 10) : "",
            endDate: banner.endDate ? banner.endDate.slice(0, 10) : "",
          }
        : emptyValues
    );
  }, [open, banner, reset]);

  const imagePreview = watch("image");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const url = await uploadBannerImage(file);
      setValue("image", url, { shouldValidate: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to upload image"));
    } finally {
      setUploading(false);
    }
  }

  function submit(values: BannerFormValues) {
    onSubmit(values, banner?.id ?? null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 min-h-[420px] max-h-[85vh]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>
              {isEdit ? t("banners.dialog.editTitle") : t("banners.dialog.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t("banners.dialog.editDescription", { id: banner!.id })
                : t("banners.dialog.addDescription")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-5">
            {/* Banner Image */}
            <div>
              <Label className={labelRowCls}>
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                {t("banners.dialog.bannerImage")} <span className="text-destructive">*</span>
              </Label>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt=""
                  className="w-full h-32 object-cover rounded-lg border mb-2"
                />
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                {uploading
                  ? t("common.actions.uploading", "Uploading…")
                  : imagePreview
                    ? t("banners.dialog.replaceImage")
                    : t("banners.dialog.uploadImage")}
              </Button>
              <p className="text-xs text-muted-foreground mt-1.5">
                {t("banners.dialog.imageHint")}
              </p>
              {errors.image && (
                <p className="text-xs text-destructive mt-1">{errors.image.message}</p>
              )}
            </div>

            {/* Title (EN / AR) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>{t("banners.dialog.titleEnglish")}</Label>
                <Input
                  className={inputCls}
                  placeholder={t("banners.dialog.titleEnglishPlaceholder")}
                  {...register("titleEn")}
                />
              </div>

              <div>
                <Label className={labelRowCls}>{t("banners.dialog.titleArabic")}</Label>
                <Input
                  className={inputCls}
                  placeholder={t("banners.dialog.titleArabicPlaceholder")}
                  dir="rtl"
                  {...register("titleAr")}
                />
              </div>
            </div>

            {/* Link + Order */}
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Link2 className="w-3.5 h-3.5 text-primary" />
                  {t("banners.dialog.linkUrl")}
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("banners.dialog.linkPlaceholder")}
                  {...register("url")}
                />
              </div>

              <div className="w-32">
                <Label className={labelRowCls}>{t("banners.dialog.displayOrder")}</Label>
                <Input
                  className={inputCls}
                  type="number"
                  min={0}
                  {...register("order", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Scheduling */}
            <div className="border-t pt-4">
              <Label className={cn(labelRowCls, "font-semibold")}>
                <CalendarClock className="w-3.5 h-3.5 text-primary" />
                {t("banners.dialog.scheduling")}
              </Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className={labelRowCls}>{t("banners.dialog.validFrom")}</Label>
                  <Input className={inputCls} type="date" {...register("startDate")} />
                </div>
                <div>
                  <Label className={labelRowCls}>{t("banners.dialog.validUntil")}</Label>
                  <Input className={inputCls} type="date" {...register("endDate")} />
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit" disabled={uploading}>
              {isEdit ? (
                <>
                  <Save className="w-4 h-4" />
                  {t("common.actions.saveChanges")}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {t("banners.addBanner")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
