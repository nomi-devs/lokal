import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Store, Mail, Phone, MapPin, Tag, User, Percent } from "lucide-react";

import type { Vendor } from "@/data/vendors";
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

const schema = z.object({
  nameEn: z.string().min(1, "Business name (English) is required"),
  nameAr: z.string().min(1, "Business name (Arabic) is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  category: z.string().min(1, "Category is required"),
  city: z.string().min(1, "City is required"),
  commissionValue: z.number().min(0).max(100),
  status: z.enum(["approved", "suspended"]),
});

export type VendorEditValues = z.infer<typeof schema>;

const inputCls = "h-10";
const labelCls = "flex items-center gap-1.5 mb-1.5 text-sm font-medium";

const selectCls =
  "h-10 w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  onSubmit: (values: VendorEditValues, id: number) => void;
}

export default function VendorEditDialog({ open, onOpenChange, vendor, onSubmit }: Props) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorEditValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!open || !vendor) {
      return;
    }

    reset({
      nameEn: vendor.nameEn,
      nameAr: vendor.nameAr,
      ownerName: vendor.ownerName,
      email: vendor.email,
      phone: vendor.phone,
      category: vendor.category,
      city: vendor.city,
      commissionValue: vendor.commission.value,
      status: vendor.status === "suspended" ? "suspended" : "approved",
    });
  }, [open, vendor, reset]);

  function submit(values: VendorEditValues) {
    if (!vendor) {
      return;
    }

    onSubmit(values, vendor.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>{t("vendors.dialog.editTitle")}</DialogTitle>
            <DialogDescription>
              {t("vendors.dialog.editDescription", { name: vendor?.nameEn })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            {/* Business Name EN / AR */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelCls}>
                  <Store className="w-3.5 h-3.5 text-primary" />
                  {t("vendors.dialog.businessNameEnglish")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input className={inputCls} {...register("nameEn")} />
                {errors.nameEn && (
                  <p className="text-xs text-destructive mt-1">{errors.nameEn.message}</p>
                )}
              </div>
              <div>
                <Label className={labelCls}>
                  <Store className="w-3.5 h-3.5 text-primary" />
                  {t("vendors.dialog.businessNameArabic")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input className={inputCls} dir="rtl" {...register("nameAr")} />
                {errors.nameAr && (
                  <p className="text-xs text-destructive mt-1">{errors.nameAr.message}</p>
                )}
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <Label className={labelCls}>
                <User className="w-3.5 h-3.5 text-primary" />
                {t("vendors.dialog.ownerName")} <span className="text-destructive">*</span>
              </Label>
              <Input className={inputCls} {...register("ownerName")} />
              {errors.ownerName && (
                <p className="text-xs text-destructive mt-1">{errors.ownerName.message}</p>
              )}
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelCls}>
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  {t("vendors.dialog.email")} <span className="text-destructive">*</span>
                </Label>
                <Input className={inputCls} {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label className={labelCls}>
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  {t("vendors.dialog.phone")} <span className="text-destructive">*</span>
                </Label>
                <Input className={inputCls} {...register("phone")} />
                {errors.phone && (
                  <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Category + City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelCls}>
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {t("vendors.dialog.category")} <span className="text-destructive">*</span>
                </Label>
                <Input className={inputCls} {...register("category")} />
                {errors.category && (
                  <p className="text-xs text-destructive mt-1">{errors.category.message}</p>
                )}
              </div>
              <div>
                <Label className={labelCls}>
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {t("vendors.dialog.city")} <span className="text-destructive">*</span>
                </Label>
                <Input className={inputCls} {...register("city")} />
                {errors.city && (
                  <p className="text-xs text-destructive mt-1">{errors.city.message}</p>
                )}
              </div>
            </div>

            {/* Commission + Account Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelCls}>
                  <Percent className="w-3.5 h-3.5 text-primary" />
                  {t("vendors.dialog.commission")}
                </Label>
                <Input
                  className={inputCls}
                  type="number"
                  min={0}
                  max={100}
                  {...register("commissionValue", { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label className={labelCls}>{t("vendors.dialog.accountStatus")}</Label>
                <select className={selectCls} {...register("status")}>
                  <option value="approved">{t("common.status.approved")}</option>
                  <option value="suspended">{t("common.status.suspended")}</option>
                </select>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit">
              <Store className="w-4 h-4" />
              {t("common.actions.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
