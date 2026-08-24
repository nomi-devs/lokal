import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Package, FolderTree, Coins, Boxes, Tag, Users2 } from "lucide-react";

import ProductImagesField from "@/components/product/ProductImagesField";
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
import { listCategories, type CategoryOption, type Product, type ProductPayload } from "@/lib/productsApi";

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
  sizes: z.string().optional(),
  colors: z.string().optional(),
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

function splitList(value?: string): string[] {
  return value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Admin only edits existing products — there's no add flow here (vendors create products). */
  product: Product | null;
  onSubmit: (payload: ProductPayload) => void;
}

export default function ProductFormDialog({ open, onOpenChange, product, onSubmit }: Props) {
  const { t } = useTranslation();
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
            sizes: product.sizes.join(", "),
            colors: product.colors.join(", "),
            stock: product.stock,
            // Form only offers active/inactive — a rejected product edited
            // here defaults to inactive rather than silently un-rejecting.
            status: product.status === "rejected" ? "inactive" : product.status,
          }
        : emptyValues
    );
  }, [open, product, reset]);

  const images = watch("images");

  if (!product) {
    return null;
  }

  function submit(values: FormValues) {
    onSubmit({
      name: { en: values.nameEn, ar: values.nameAr || undefined },
      description: { en: values.descriptionEn, ar: values.descriptionAr || undefined },
      images: values.images,
      categoryId: values.categoryId,
      gender: values.gender,
      price: values.price,
      compareAtPrice: values.compareAtPrice,
      sizes: splitList(values.sizes),
      colors: splitList(values.colors),
      stock: values.stock,
      inStock: values.stock > 0,
      status: values.status,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>{t("products.dialog.editTitle")}</DialogTitle>
            <DialogDescription>{t("products.dialog.editDescription", { name: product.name.en })}</DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  {t("products.dialog.nameEnglish")} <span className="text-destructive">*</span>
                </Label>
                <Input className={inputCls} placeholder={t("products.dialog.nameEnglishPlaceholder")} {...register("nameEn")} />
                {errors.nameEn && <p className="text-xs text-destructive mt-1">{errors.nameEn.message}</p>}
              </div>

              <div>
                <Label className={labelRowCls}>{t("products.dialog.nameArabic")}</Label>
                <Input
                  className={inputCls}
                  placeholder={t("products.dialog.nameArabicPlaceholder")}
                  dir="rtl"
                  {...register("nameAr")}
                />
              </div>
            </div>

            <div>
              <Label className={labelRowCls}>{t("products.dialog.descriptionEnglish")}</Label>
              <textarea
                className={textareaCls}
                placeholder={t("products.dialog.descriptionEnglishPlaceholder")}
                {...register("descriptionEn")}
              />
              {errors.descriptionEn && <p className="text-xs text-destructive mt-1">{errors.descriptionEn.message}</p>}
            </div>

            <div>
              <Label className={labelRowCls}>{t("products.dialog.descriptionArabic")}</Label>
              <textarea
                className={textareaCls}
                placeholder={t("products.dialog.descriptionArabicPlaceholder")}
                dir="rtl"
                {...register("descriptionAr")}
              />
            </div>

            <ProductImagesField
              label={t("products.dialog.images")}
              addLabel={t("products.dialog.addImage")}
              uploadingLabel={t("products.dialog.uploading")}
              images={images}
              onChange={(next) => setValue("images", next, { shouldValidate: true })}
            />
            {errors.images && <p className="text-xs text-destructive -mt-3">{errors.images.message}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <FolderTree className="w-3.5 h-3.5 text-primary" />
                  {t("products.dialog.category")} <span className="text-destructive">*</span>
                </Label>
                <select className={selectCls} {...register("categoryId")}>
                  <option value="">{t("products.dialog.selectCategory")}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>}
              </div>

              <div>
                <Label className={labelRowCls}>
                  <Users2 className="w-3.5 h-3.5 text-primary" />
                  {t("products.dialog.gender")}
                </Label>
                <select className={selectCls} {...register("gender")}>
                  <option value="unisex">{t("common.genders.unisex")}</option>
                  <option value="male">{t("common.genders.male")}</option>
                  <option value="female">{t("common.genders.female")}</option>
                  <option value="kids">{t("common.genders.kids")}</option>
                </select>
              </div>
            </div>

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
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <Label className={labelRowCls}>
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {t("products.dialog.compareAtPrice")}
                </Label>
                <Input
                  className={inputCls}
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={t("products.dialog.compareAtPricePlaceholder")}
                  {...register("compareAtPrice", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
                />
                {errors.compareAtPrice ? (
                  <p className="text-xs text-destructive mt-1">{errors.compareAtPrice.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">{t("products.dialog.compareAtPriceHint")}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>{t("products.dialog.sizes")}</Label>
                <Input className={inputCls} placeholder={t("products.dialog.sizesPlaceholder")} {...register("sizes")} />
              </div>

              <div>
                <Label className={labelRowCls}>{t("products.dialog.colors")}</Label>
                <Input className={inputCls} placeholder={t("products.dialog.colorsPlaceholder")} {...register("colors")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <Label className={labelRowCls}>
                  <Boxes className="w-3.5 h-3.5 text-primary" />
                  {t("products.dialog.stock")}
                </Label>
                <Input className={inputCls} type="number" min={0} {...register("stock", { valueAsNumber: true })} />
              </div>

              <div>
                <Label className={labelRowCls}>{t("products.dialog.status")}</Label>
                <select className={selectCls} {...register("status")}>
                  <option value="active">{t("products.list.status.active")}</option>
                  <option value="inactive">{t("products.list.status.inactive")}</option>
                </select>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("products.dialog.close")}
            </Button>
            <Button type="submit">{t("products.dialog.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
