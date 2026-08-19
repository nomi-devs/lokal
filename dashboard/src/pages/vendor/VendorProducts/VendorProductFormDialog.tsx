import { useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  Package,
  Image as ImageIcon,
  FolderTree,
  Coins,
  Boxes,
  Tag,
  Users2,
  Wand2,
} from "lucide-react";

import type { Product } from "@/data/products";
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

const variantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.number().int().min(0, "Stock must be 0 or more"),
});

const productSchema = z.object({
  nameEn: z.string().min(1, "Name (English) is required"),
  nameAr: z.string().min(1, "Name (Arabic) is required"),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  image: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  department: z.enum(["men", "women", "kids", "unisex"]),
  price: z.object({
    base: z.number().min(0, "Price must be 0 or more"),
    currency: z.enum(["KWD", "SAR"]),
    compareAt: z.number().optional(),
  }),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  stock: z.number().int().min(0, "Stock must be 0 or more"),
  variants: z.array(variantSchema).optional(),
  status: z.enum(["active", "inactive", "out_of_stock"]),
});

export type VendorProductFormValues = z.infer<typeof productSchema>;

const emptyValues: VendorProductFormValues = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  image: "",
  categoryId: "",
  department: "unisex",
  price: { base: 0, currency: "KWD", compareAt: undefined },
  sizes: "",
  colors: "",
  stock: 0,
  variants: [],
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

export interface VendorProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a product to edit it; omit/null to add a new one. Same dialog handles both. */
  product?: Product | null;
  onSubmit: (values: VendorProductFormValues, editingId: number | null) => void;
}

export default function VendorProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
}: VendorProductFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<VendorProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  const { fields: variantFields, replace: replaceVariants } = useFieldArray({
    control,
    name: "variants",
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
            categoryId: String(product.categoryId),
            department: product.department,
            price: {
              base: product.price.base,
              currency: product.price.currency,
              compareAt: product.price.compareAt,
            },
            sizes: product.sizes.join(", "),
            colors: product.colors.join(", "),
            stock: product.stock,
            variants: product.variants ?? [],
            status: product.status,
          }
        : emptyValues
    );
  }, [open, product, reset]);

  const sizesValue = watch("sizes") ?? "";
  const colorsValue = watch("colors") ?? "";

  // Builds one row per size×color pair, keeping existing stock numbers for combos that survive.
  function generateVariants() {
    const sizeList = sizesValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const colorList = colorsValue
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const pairs: { size?: string; color?: string }[] =
      sizeList.length && colorList.length
        ? sizeList.flatMap((size) => colorList.map((color) => ({ size, color })))
        : sizeList.length
          ? sizeList.map((size) => ({ size }))
          : colorList.map((color) => ({ color }));

    const existing = new Map(
      variantFields.map((v) => [`${v.size ?? ""}::${v.color ?? ""}`, v.stock])
    );

    replaceVariants(
      pairs.map((p) => ({
        size: p.size,
        color: p.color,
        stock: existing.get(`${p.size ?? ""}::${p.color ?? ""}`) ?? 0,
      }))
    );
  }

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

  function submit(values: VendorProductFormValues) {
    const stock = values.variants?.length
      ? values.variants.reduce((sum, v) => sum + v.stock, 0)
      : values.stock;

    onSubmit({ ...values, stock }, product?.id ?? null);
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
              {isEdit
                ? t("vendor.products.dialog.editTitle")
                : t("vendor.products.dialog.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t("vendor.products.dialog.editDescription", { name: product!.nameEn })
                : t("vendor.products.dialog.addDescription")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-5">
            {/* Name EN / AR */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  {t("vendor.products.dialog.nameEnglish")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("vendor.products.dialog.nameEnglishPlaceholder")}
                  {...register("nameEn")}
                />
                {errors.nameEn && (
                  <p className="text-xs text-destructive mt-1">{errors.nameEn.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  {t("vendor.products.dialog.nameArabic")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("vendor.products.dialog.nameArabicPlaceholder")}
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
              <Label className={labelRowCls}>
                {t("vendor.products.dialog.descriptionEnglish")}
              </Label>
              <textarea className={textareaCls} {...register("descriptionEn")} />
            </div>

            {/* Description AR */}
            <div>
              <Label className={labelRowCls}>{t("vendor.products.dialog.descriptionArabic")}</Label>
              <textarea className={textareaCls} dir="rtl" {...register("descriptionAr")} />
            </div>

            {/* Product Image */}
            <ImageDropField
              label={t("vendor.products.dialog.productImage")}
              icon={ImageIcon}
              value={imagePreview}
              placeholder={t("vendor.products.dialog.chooseImage")}
              onChange={(url) => {
                trackObjectUrl(url);
                setValue("image", url, { shouldValidate: true });
              }}
            />

            {/* Category + Department */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <FolderTree className="w-3.5 h-3.5 text-primary" />
                  {t("vendor.products.dialog.category")} <span className="text-destructive">*</span>
                </Label>
                <select className={selectCls} {...register("categoryId")}>
                  <option value="">{t("vendor.products.dialog.selectCategory")}</option>
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

              <div>
                <Label className={labelRowCls}>
                  <Users2 className="w-3.5 h-3.5 text-primary" />
                  {t("vendor.products.dialog.department")}
                </Label>
                <select className={selectCls} {...register("department")}>
                  <option value="unisex">{t("common.departments.unisex")}</option>
                  <option value="men">{t("common.departments.men")}</option>
                  <option value="women">{t("common.departments.women")}</option>
                  <option value="kids">{t("common.departments.kids")}</option>
                </select>
              </div>
            </div>

            {/* Price + Compare-at + Currency */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  {t("vendor.products.dialog.price")}
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
                <Label className={labelRowCls}>
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {t("vendor.products.dialog.compareAtPrice")}
                </Label>
                <Input
                  className={inputCls}
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={t("vendor.products.dialog.compareAtPricePlaceholder")}
                  {...register("price.compareAt", {
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("vendor.products.dialog.compareAtPriceHint")}
                </p>
              </div>

              <div>
                <Label className={labelRowCls}>{t("vendor.products.dialog.currency")}</Label>
                <select className={selectCls} {...register("price.currency")}>
                  <option value="KWD">{t("vendor.products.dialog.currencyKWD")}</option>
                  <option value="SAR">{t("vendor.products.dialog.currencySAR")}</option>
                </select>
              </div>
            </div>

            {/* Sizes + Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>{t("vendor.products.dialog.sizes")}</Label>
                <Input
                  className={inputCls}
                  placeholder={t("vendor.products.dialog.sizesPlaceholder")}
                  {...register("sizes")}
                />
              </div>

              <div>
                <Label className={labelRowCls}>{t("vendor.products.dialog.colors")}</Label>
                <Input
                  className={inputCls}
                  placeholder={t("vendor.products.dialog.colorsPlaceholder")}
                  {...register("colors")}
                />
              </div>
            </div>

            {/* Per-variant stock */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="flex items-center gap-1.5">
                  {t("vendor.products.dialog.variants")}
                </Label>
                <button
                  type="button"
                  onClick={generateVariants}
                  disabled={!sizesValue.trim() && !colorsValue.trim()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  {t("vendor.products.dialog.generateVariants")}
                </button>
              </div>
              {variantFields.length > 0 ? (
                <div className="border rounded-lg divide-y max-h-52 overflow-y-auto">
                  {variantFields.map((field, i) => (
                    <div key={field.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <span className="flex-1 truncate">
                        {[field.size, field.color].filter(Boolean).join(" / ") || "—"}
                      </span>
                      <Input
                        className="h-8 w-24"
                        type="number"
                        min={0}
                        {...register(`variants.${i}.stock`, { valueAsNumber: true })}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("vendor.products.dialog.variantsHint")}
                </p>
              )}
            </div>

            {/* Stock + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Boxes className="w-3.5 h-3.5 text-primary" />
                  {t("vendor.products.dialog.stock")}
                </Label>
                <Input
                  className={inputCls}
                  type="number"
                  min={0}
                  disabled={variantFields.length > 0}
                  {...register("stock", { valueAsNumber: true })}
                />
                {variantFields.length > 0 ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("vendor.products.dialog.stockDerivedHint")}
                  </p>
                ) : (
                  errors.stock && (
                    <p className="text-xs text-destructive mt-1">{errors.stock.message}</p>
                  )
                )}
              </div>

              <div>
                <Label className={labelRowCls}>{t("vendor.products.dialog.status")}</Label>
                <select className={selectCls} {...register("status")}>
                  <option value="active">{t("vendor.products.list.status.active")}</option>
                  <option value="inactive">{t("vendor.products.list.status.inactive")}</option>
                  <option value="out_of_stock">
                    {t("vendor.products.list.status.outOfStock")}
                  </option>
                </select>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("vendor.products.dialog.close")}
            </Button>
            <Button type="submit">
              {isEdit ? t("vendor.products.dialog.save") : t("vendor.products.dialog.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
