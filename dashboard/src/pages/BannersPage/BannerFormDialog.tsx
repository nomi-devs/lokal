import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, Layers, Link2, CalendarClock, Upload, Plus, Save } from "lucide-react";

import type { Banner, BannerPosition } from "@/data/banners";
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

const POSITIONS: BannerPosition[] = ["Home Top", "Home Middle", "Category Page", "Checkout"];

const positionKey: Record<BannerPosition, string> = {
  "Home Top": "homeTop",
  "Home Middle": "homeMiddle",
  "Category Page": "categoryPage",
  Checkout: "checkout",
};

const bannerSchema = z.object({
  image: z.string().min(1, "Banner image is required"),
  titleEn: z.string().min(1, "Title is required"),
  titleAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  position: z.enum(["Home Top", "Home Middle", "Category Page", "Checkout"]),
  url: z.string().min(1, "Link is required"),
  order: z.number().int().min(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;

const emptyValues: BannerFormValues = {
  image: "",
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  position: "Home Top",
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
  banner?: Banner | null;
  onSubmit: (values: BannerFormValues, editingId: number | null) => void;
}

export default function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  onSubmit,
}: BannerFormDialogProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
            image: banner.image,
            titleEn: banner.titleEn,
            titleAr: banner.titleAr ?? "",
            descriptionEn: banner.descriptionEn ?? "",
            descriptionAr: banner.descriptionAr ?? "",
            position: banner.position,
            url: banner.url,
            order: banner.order,
            startDate: banner.startDate ?? "",
            endDate: banner.endDate ?? "",
          }
        : emptyValues
    );
  }, [open, banner, reset]);

  const imagePreview = watch("image");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Template placeholder — swap for your upload endpoint and store the returned URL instead.
    const url = URL.createObjectURL(file);

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    setObjectUrl(url);
    setValue("image", url, { shouldValidate: true });
  }

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  function submit(values: BannerFormValues) {
    onSubmit(values, banner?.id ?? null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
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
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                {imagePreview ? t("banners.dialog.replaceImage") : t("banners.dialog.uploadImage")}
              </Button>
              <p className="text-xs text-muted-foreground mt-1.5">
                {t("banners.dialog.imageHint")}
              </p>
              {errors.image && (
                <p className="text-xs text-destructive mt-1">{errors.image.message}</p>
              )}
            </div>

            {/* Title (EN) + Position */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>{t("banners.dialog.titleEnglish")}</Label>
                <Input
                  className={inputCls}
                  placeholder={t("banners.dialog.titleEnglishPlaceholder")}
                  {...register("titleEn")}
                />
                {errors.titleEn && (
                  <p className="text-xs text-destructive mt-1">{errors.titleEn.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  {t("banners.filterPosition")}
                </Label>
                <select
                  className={cn(
                    inputCls,
                    "w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                  )}
                  {...register("position")}
                >
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {t(`banners.positions.${positionKey[p]}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title (AR) */}
            <div>
              <Label className={labelRowCls}>{t("banners.dialog.titleArabic")}</Label>
              <Input
                className={inputCls}
                placeholder={t("banners.dialog.titleArabicPlaceholder")}
                dir="rtl"
                {...register("titleAr")}
              />
            </div>

            {/* Description EN / AR */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>{t("categories.dialog.descriptionEnglish")}</Label>
                <Input className={inputCls} {...register("descriptionEn")} />
              </div>
              <div>
                <Label className={labelRowCls}>{t("categories.dialog.descriptionArabic")}</Label>
                <Input className={inputCls} dir="rtl" {...register("descriptionAr")} />
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
                {errors.url && (
                  <p className="text-xs text-destructive mt-1">{errors.url.message}</p>
                )}
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
            <Button type="submit">
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
