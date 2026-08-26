import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Package, FolderTree, Coins, Boxes, Tag, Users2, Ruler, Palette, Power } from "lucide-react";

import ProductImagesField from "@/components/product/ProductImagesField";
import ProductMultiSelectField from "@/components/product/ProductMultiSelectField";
import Badge from "@/components/ui/badge";
import {
  PRODUCT_SIZE_SUGGESTIONS,
  PRODUCT_COLOR_SUGGESTIONS,
  PRODUCT_COLOR_SWATCHES,
} from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
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
import {
  listCategories,
  type CategoryOption,
  type Product,
  type ProductPayload,
} from "@/lib/productsApi";

const productSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().optional(),
  descriptionEn: z.string().min(1),
  descriptionAr: z.string().optional(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  categoryId: z.string().min(1, "Category is required"),
  gender: z.enum(["male", "female", "kids", "unisex"]),
  price: z.number().min(0.01, "Price must be greater than 0"),
  compareAtPrice: z.number().optional(),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  stock: z.number().int().min(0),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof productSchema>;

const emptyValues: FormValues = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  images: [],
  categoryId: "",
  gender: "unisex",
  price: 0,
  compareAtPrice: undefined,
  sizes: [],
  colors: [],
  stock: 0,
  status: "active",
};

const inputCls = "h-10";
const labelRowCls = "flex items-center gap-1.5 mb-1.5";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a product to edit it; omit/null to add a new one. Same dialog handles both. */
  product?: Product | null;
  onSubmit: (payload: ProductPayload, editingId: string | null) => void;
}

export default function VendorProductFormDialog({ open, onOpenChange, product, onSubmit }: Props) {
  const { t } = useTranslation();
  const isEdit = !!product;
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {
        // Category picker just stays empty — the form itself is still usable.
      });
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      product
        ? {
            nameEn: product.name.en,
            nameAr: product.name.ar ?? "",
            descriptionEn: product.description.en,
            descriptionAr: product.description.ar ?? "",
            images: product.images,
            categoryId: product.categoryId,
            gender: product.gender,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            sizes: product.sizes,
            colors: product.colors,
            stock: product.stock,
            // Form only offers active/inactive — a rejected product edited
            // here defaults to inactive rather than silently un-rejecting.
            status: product.status === "rejected" ? "inactive" : product.status,
          }
        : emptyValues
    );
  }, [open, product, reset]);

  const images = watch("images");
  const sizes = watch("sizes");
  const colors = watch("colors");
  const status = watch("status");

  function submit(values: FormValues) {
    const base = {
      name: { en: values.nameEn, ar: values.nameAr || undefined },
      description: { en: values.descriptionEn, ar: values.descriptionAr || undefined },
      images: values.images,
      categoryId: values.categoryId,
      gender: values.gender,
      price: values.price,
      compareAtPrice: values.compareAtPrice,
      sizes: values.sizes,
      colors: values.colors,
      stock: values.stock,
      inStock: values.stock > 0,
    };
    onSubmit(isEdit ? { ...base, status: values.status } : base, product?.id ?? null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 w-[95vw] max-w-5xl min-h-[520px] max-h-[92vh]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="flex items-center gap-2">
              {isEdit
                ? t("vendor.products.dialog.editTitle")
                : t("vendor.products.dialog.addTitle")}
              {isEdit && product && product.status === "rejected" && (
                <Badge variant="danger">{t("vendor.products.list.status.rejected")}</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t("vendor.products.dialog.editDescription", { name: product!.name.en })
                : t("vendor.products.dialog.addDescription")}
              {isEdit && product?.status === "rejected" && product.rejectionReason && (
                <span className="block mt-1 text-destructive">{product.rejectionReason}</span>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-5">
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
                <Label className={labelRowCls}>{t("vendor.products.dialog.nameArabic")}</Label>
                <Input
                  className={inputCls}
                  placeholder={t("vendor.products.dialog.nameArabicPlaceholder")}
                  dir="rtl"
                  {...register("nameAr")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  {t("vendor.products.dialog.descriptionEnglish")}
                </Label>
                <Textarea className="min-h-20" {...register("descriptionEn")} />
                {errors.descriptionEn && (
                  <p className="text-xs text-destructive mt-1">{errors.descriptionEn.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  {t("vendor.products.dialog.descriptionArabic")}
                </Label>
                <Textarea className="min-h-20" dir="rtl" {...register("descriptionAr")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <ProductImagesField
                  label={t("vendor.products.dialog.images")}
                  addLabel={t("vendor.products.dialog.addImage")}
                  uploadingLabel={t("vendor.products.dialog.uploading")}
                  images={images}
                  onChange={(next) => setValue("images", next, { shouldValidate: true })}
                />
                {errors.images && (
                  <p className="text-xs text-destructive mt-1">{errors.images.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  <Power className="w-3.5 h-3.5 text-primary" />
                  {t("vendor.products.dialog.status")}
                </Label>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={status === "active"}
                      onChange={(e) =>
                        setValue("status", e.target.checked ? "active" : "inactive", {
                          shouldValidate: true,
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-muted peer-checked:bg-primary rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                  <span className="text-sm font-medium">
                    {status === "active"
                      ? t("vendor.products.list.status.active")
                      : t("vendor.products.list.status.inactive")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <FolderTree className="w-3.5 h-3.5 text-primary" />
                  {t("vendor.products.dialog.category")} <span className="text-destructive">*</span>
                </Label>
                <Select {...register("categoryId")}>
                  <option value="">{t("vendor.products.dialog.selectCategory")}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn}
                    </option>
                  ))}
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  <Users2 className="w-3.5 h-3.5 text-primary" />
                  {t("vendor.products.dialog.gender")}
                </Label>
                <Select {...register("gender")}>
                  <option value="unisex">{t("common.genders.unisex")}</option>
                  <option value="male">{t("common.genders.male")}</option>
                  <option value="female">{t("common.genders.female")}</option>
                  <option value="kids">{t("common.genders.kids")}</option>
                </Select>
              </div>
            </div>

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
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-xs text-destructive mt-1">{errors.price.message}</p>
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
                  {...register("compareAtPrice", {
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                />
                {errors.compareAtPrice ? (
                  <p className="text-xs text-destructive mt-1">{errors.compareAtPrice.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("vendor.products.dialog.compareAtPriceHint")}
                  </p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  <Boxes className="w-3.5 h-3.5 text-primary" />
                  {t("vendor.products.dialog.stock")}
                </Label>
                <Input
                  className={inputCls}
                  type="number"
                  min={0}
                  {...register("stock", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ProductMultiSelectField
                icon={Ruler}
                label={t("vendor.products.dialog.sizes")}
                placeholder={t("vendor.products.dialog.sizesPlaceholder")}
                searchPlaceholder={t("vendor.products.dialog.sizesSearchPlaceholder")}
                values={sizes}
                onChange={(next) => setValue("sizes", next, { shouldValidate: true })}
                options={PRODUCT_SIZE_SUGGESTIONS}
              />

              <ProductMultiSelectField
                icon={Palette}
                label={t("vendor.products.dialog.colors")}
                placeholder={t("vendor.products.dialog.colorsPlaceholder")}
                searchPlaceholder={t("vendor.products.dialog.colorsSearchPlaceholder")}
                values={colors}
                onChange={(next) => setValue("colors", next, { shouldValidate: true })}
                options={PRODUCT_COLOR_SUGGESTIONS}
                showColorSwatch
                swatchMap={PRODUCT_COLOR_SWATCHES}
              />
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
