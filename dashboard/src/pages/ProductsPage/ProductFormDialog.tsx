import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Package, Image as ImageIcon, Store, FolderTree, Coins, Boxes } from "lucide-react";

import type { Product } from "@/data/products";
import { initialVendors } from "@/data/vendors";
import { categories } from "@/data/categories";
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

const productSchema = z.object({
  nameEn: z.string().min(1, "Name (English) is required"),
  nameAr: z.string().min(1, "Name (Arabic) is required"),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  image: z.string().optional(),
  vendorId: z.string().min(1, "Vendor is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.object({
    base: z.number().min(0, "Price must be 0 or more"),
    currency: z.enum(["KWD", "SAR"]),
  }),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  stock: z.number().int().min(0, "Stock must be 0 or more"),
  status: z.enum(["active", "inactive", "out_of_stock"]),
});

export type ProductFormValues = z.infer<typeof productSchema>;

const emptyValues: ProductFormValues = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  image: "",
  vendorId: "",
  categoryId: "",
  price: { base: 0, currency: "KWD" },
  sizes: "",
  colors: "",
  stock: 0,
  status: "active",
};

const inputCls = "h-10";
const labelRowCls = "flex items-center gap-1.5 mb-1.5";

const selectCls = cn(
  inputCls,
  "w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
);

const textareaCls = cn(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "min-h-20 resize-y"
);

function ImageDropField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: typeof ImageIcon;
  value: string;
  onChange: (url: string) => void;
  placeholder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Template placeholder — swap for your upload endpoint and store the returned URL instead.
    onChange(URL.createObjectURL(file));
  }

  return (
    <div>
      <Label className={labelRowCls}>
        <Icon className="w-3.5 h-3.5 text-primary" />
        {label}
      </Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "w-full h-28 rounded-lg border border-dashed flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 overflow-hidden",
          value && "border-solid p-0"
        )}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <>
            <ImageIcon className="w-4 h-4" />
            {placeholder}
          </>
        )}
      </button>
    </div>
  );
}

export interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a product to edit it; omit/null to add a new one. Same dialog handles both. */
  product?: Product | null;
  onSubmit: (values: ProductFormValues, editingId: number | null) => void;
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
}: ProductFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  // Re-seed the form whenever a different product is opened for edit (or the dialog reopens in add mode).
  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      product
        ? {
            nameEn: product.nameEn,
            nameAr: product.nameAr,
            descriptionEn: product.descriptionEn ?? "",
            descriptionAr: product.descriptionAr ?? "",
            image: product.images[0] ?? "",
            vendorId: String(product.vendorId),
            categoryId: String(product.categoryId),
            price: { base: product.price.base, currency: product.price.currency },
            sizes: product.sizes.join(", "),
            colors: product.colors.join(", "),
            stock: product.stock,
            status: product.status,
          }
        : emptyValues
    );
  }, [open, product, reset]);

  const imagePreview = watch("image") ?? "";
  const objectUrlsRef = useRef<string[]>([]);

  function trackObjectUrl(url: string) {
    objectUrlsRef.current.push(url);
  }

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function submit(values: ProductFormValues) {
    onSubmit(values, product?.id ?? null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>
              {isEdit ? t("products.dialog.editTitle") : t("products.dialog.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t("products.dialog.editDescription", { name: product!.nameEn })
                : t("products.dialog.addDescription")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-5">
            {/* Name EN / AR */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  {t("products.dialog.nameEnglish")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("products.dialog.nameEnglishPlaceholder")}
                  {...register("nameEn")}
                />
                {errors.nameEn && (
                  <p className="text-xs text-destructive mt-1">{errors.nameEn.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  {t("products.dialog.nameArabic")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("products.dialog.nameArabicPlaceholder")}
                  dir="rtl"
                  {...register("nameAr")}
                />
                {errors.nameAr && (
                  <p className="text-xs text-destructive mt-1">{errors.nameAr.message}</p>
                )}
              </div>
            </div>

            {/* Description EN */}
            <div>
              <Label className={labelRowCls}>{t("products.dialog.descriptionEnglish")}</Label>
              <textarea
                className={textareaCls}
                placeholder={t("products.dialog.descriptionEnglishPlaceholder")}
                {...register("descriptionEn")}
              />
            </div>

            {/* Description AR */}
            <div>
              <Label className={labelRowCls}>{t("products.dialog.descriptionArabic")}</Label>
              <textarea
                className={textareaCls}
                placeholder={t("products.dialog.descriptionArabicPlaceholder")}
                dir="rtl"
                {...register("descriptionAr")}
              />
            </div>

            {/* Product Image */}
            <ImageDropField
              label={t("products.dialog.productImage")}
              icon={ImageIcon}
              value={imagePreview}
              placeholder={t("products.dialog.chooseImage")}
              onChange={(url) => {
                trackObjectUrl(url);
                setValue("image", url, { shouldValidate: true });
              }}
            />

            {/* Vendor + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Store className="w-3.5 h-3.5 text-primary" />
                  {t("products.dialog.vendor")} <span className="text-destructive">*</span>
                </Label>
                <select className={selectCls} {...register("vendorId")}>
                  <option value="">{t("products.dialog.selectVendor")}</option>
                  {initialVendors.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {v.nameEn}
                    </option>
                  ))}
                </select>
                {errors.vendorId && (
                  <p className="text-xs text-destructive mt-1">{errors.vendorId.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  <FolderTree className="w-3.5 h-3.5 text-primary" />
                  {t("products.dialog.category")} <span className="text-destructive">*</span>
                </Label>
                <select className={selectCls} {...register("categoryId")}>
                  <option value="">{t("products.dialog.selectCategory")}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.nameEn}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  {t("products.dialog.price")}
                </Label>
                <Input
                  className={inputCls}
                  type="number"
                  min={0}
                  step="0.01"
                  {...register("price.base", { valueAsNumber: true })}
                />
                {errors.price?.base && (
                  <p className="text-xs text-destructive mt-1">{errors.price.base.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>{t("products.dialog.currency")}</Label>
                <select className={selectCls} {...register("price.currency")}>
                  <option value="KWD">{t("products.dialog.currencyKWD")}</option>
                  <option value="SAR">{t("products.dialog.currencySAR")}</option>
                </select>
              </div>
            </div>

            {/* Sizes + Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>{t("products.dialog.sizes")}</Label>
                <Input
                  className={inputCls}
                  placeholder={t("products.dialog.sizesPlaceholder")}
                  {...register("sizes")}
                />
              </div>

              <div>
                <Label className={labelRowCls}>{t("products.dialog.colors")}</Label>
                <Input
                  className={inputCls}
                  placeholder={t("products.dialog.colorsPlaceholder")}
                  {...register("colors")}
                />
              </div>
            </div>

            {/* Stock + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Boxes className="w-3.5 h-3.5 text-primary" />
                  {t("products.dialog.stock")}
                </Label>
                <Input
                  className={inputCls}
                  type="number"
                  min={0}
                  {...register("stock", { valueAsNumber: true })}
                />
                {errors.stock && (
                  <p className="text-xs text-destructive mt-1">{errors.stock.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>{t("products.dialog.status")}</Label>
                <select className={selectCls} {...register("status")}>
                  <option value="active">{t("products.list.status.active")}</option>
                  <option value="inactive">{t("products.list.status.inactive")}</option>
                  <option value="out_of_stock">{t("products.list.status.outOfStock")}</option>
                </select>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("products.dialog.close")}
            </Button>
            <Button type="submit">
              {isEdit ? t("products.dialog.save") : t("products.dialog.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
