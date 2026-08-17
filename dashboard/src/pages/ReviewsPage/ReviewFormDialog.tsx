import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  Star,
  Package,
  ShoppingBag,
  User,
  Type,
  MessageSquare,
  ShieldCheck,
  Flag,
} from "lucide-react";

import type { Review } from "@/data/reviews";
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

const reviewSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  orderId: z.string().min(1, "Order is required"),
  userId: z.string().min(1, "Reviewer is required"),
  rating: z.number().int().min(1).max(5),
  titleEn: z.string().min(1, "Title (English) is required"),
  titleAr: z.string().min(1, "Title (Arabic) is required"),
  commentEn: z.string().min(1, "Comment (English) is required"),
  commentAr: z.string().min(1, "Comment (Arabic) is required"),
  isVerifiedPurchase: z.boolean(),
  status: z.enum(["pending", "approved", "rejected"]),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

const emptyValues: ReviewFormValues = {
  productId: "",
  orderId: "",
  userId: "",
  rating: 5,
  titleEn: "",
  titleAr: "",
  commentEn: "",
  commentAr: "",
  isVerifiedPurchase: false,
  status: "pending",
};

const inputCls = "h-10";
const labelRowCls = "flex items-center gap-1.5 mb-1.5";

const textareaCls = cn(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "min-h-20 resize-y"
);

const selectCls = cn(
  inputCls,
  "w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
);

export interface ReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a review to edit it; omit/null to add a new one. Same dialog handles both. */
  review?: Review | null;
  productOptions: { id: number; name: string }[];
  orderOptions: { id: number; name: string }[];
  userOptions: { id: number; name: string }[];
  onSubmit: (values: ReviewFormValues, editingId: number | null) => void;
}

export default function ReviewFormDialog({
  open,
  onOpenChange,
  review,
  productOptions,
  orderOptions,
  userOptions,
  onSubmit,
}: ReviewFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!review;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: emptyValues,
  });

  // Re-seed the form whenever a different review is opened for edit (or the dialog reopens in add mode).
  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      review
        ? {
            productId: String(review.productId),
            orderId: String(review.orderId),
            userId: String(review.userId),
            rating: review.rating,
            titleEn: review.titleEn,
            titleAr: review.titleAr,
            commentEn: review.commentEn,
            commentAr: review.commentAr,
            isVerifiedPurchase: review.isVerifiedPurchase,
            status: review.status,
          }
        : emptyValues
    );
  }, [open, review, reset]);

  function submit(values: ReviewFormValues) {
    onSubmit(values, review?.id ?? null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>
              {isEdit ? t("reviews.dialog.editTitle") : t("reviews.dialog.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t("reviews.dialog.editDescription", { title: review!.titleEn })
                : t("reviews.dialog.addDescription")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-5">
            {/* Product + Order */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Package className="w-3.5 h-3.5 text-primary" />
                  {t("reviews.dialog.product")} <span className="text-destructive">*</span>
                </Label>
                <select className={selectCls} {...register("productId")}>
                  <option value="">{t("reviews.dialog.productPlaceholder")}</option>
                  {productOptions.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.productId && (
                  <p className="text-xs text-destructive mt-1">{errors.productId.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                  {t("reviews.dialog.order")} <span className="text-destructive">*</span>
                </Label>
                <select className={selectCls} {...register("orderId")}>
                  <option value="">{t("reviews.dialog.orderPlaceholder")}</option>
                  {orderOptions.map((o) => (
                    <option key={o.id} value={String(o.id)}>
                      {o.name}
                    </option>
                  ))}
                </select>
                {errors.orderId && (
                  <p className="text-xs text-destructive mt-1">{errors.orderId.message}</p>
                )}
              </div>
            </div>

            {/* Reviewer + Rating */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <User className="w-3.5 h-3.5 text-primary" />
                  {t("reviews.dialog.reviewer")} <span className="text-destructive">*</span>
                </Label>
                <select className={selectCls} {...register("userId")}>
                  <option value="">{t("reviews.dialog.reviewerPlaceholder")}</option>
                  {userOptions.map((u) => (
                    <option key={u.id} value={String(u.id)}>
                      {u.name}
                    </option>
                  ))}
                </select>
                {errors.userId && (
                  <p className="text-xs text-destructive mt-1">{errors.userId.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  <Star className="w-3.5 h-3.5 text-primary" />
                  {t("reviews.dialog.rating")}
                </Label>
                <select className={selectCls} {...register("rating", { valueAsNumber: true })}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title EN / AR */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Type className="w-3.5 h-3.5 text-primary" />
                  {t("reviews.dialog.titleEnglish")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("reviews.dialog.titleEnglishPlaceholder")}
                  {...register("titleEn")}
                />
                {errors.titleEn && (
                  <p className="text-xs text-destructive mt-1">{errors.titleEn.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  <Type className="w-3.5 h-3.5 text-primary" />
                  {t("reviews.dialog.titleArabic")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("reviews.dialog.titleArabicPlaceholder")}
                  dir="rtl"
                  {...register("titleAr")}
                />
                {errors.titleAr && (
                  <p className="text-xs text-destructive mt-1">{errors.titleAr.message}</p>
                )}
              </div>
            </div>

            {/* Comment EN */}
            <div>
              <Label className={labelRowCls}>
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                {t("reviews.dialog.commentEnglish")} <span className="text-destructive">*</span>
              </Label>
              <textarea
                className={textareaCls}
                placeholder={t("reviews.dialog.commentEnglishPlaceholder")}
                {...register("commentEn")}
              />
              {errors.commentEn && (
                <p className="text-xs text-destructive mt-1">{errors.commentEn.message}</p>
              )}
            </div>

            {/* Comment AR */}
            <div>
              <Label className={labelRowCls}>
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                {t("reviews.dialog.commentArabic")} <span className="text-destructive">*</span>
              </Label>
              <textarea
                className={textareaCls}
                placeholder={t("reviews.dialog.commentArabicPlaceholder")}
                dir="rtl"
                {...register("commentAr")}
              />
              {errors.commentAr && (
                <p className="text-xs text-destructive mt-1">{errors.commentAr.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <Label className={labelRowCls}>
                <Flag className="w-3.5 h-3.5 text-primary" />
                {t("reviews.dialog.status")}
              </Label>
              <select className={selectCls} {...register("status")}>
                <option value="pending">{t("common.status.pending")}</option>
                <option value="approved">{t("common.status.approved")}</option>
                <option value="rejected">{t("common.status.rejected")}</option>
              </select>
            </div>

            {/* Verified Purchase */}
            <div className="flex items-center gap-3">
              <Label className={labelRowCls + " mb-0"}>
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                {t("reviews.dialog.verifiedPurchase")}
              </Label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  {...register("isVerifiedPurchase")}
                />
                <div className="w-11 h-6 bg-muted peer-checked:bg-primary rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("reviews.dialog.close")}
            </Button>
            <Button type="submit">
              {isEdit ? t("reviews.dialog.save") : t("reviews.dialog.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
