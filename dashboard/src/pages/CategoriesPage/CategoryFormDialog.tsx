import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { FolderTree, Image as ImageIcon, Layers, ListOrdered, Loader2, Users2 } from "lucide-react";

import type { AdminCategory } from "@/lib/adminApi";
import { uploadCategoryIcon } from "@/lib/adminApi";
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

const categorySchema = z.object({
  nameEn: z.string().min(1, "Name (English) is required"),
  nameAr: z.string().min(1, "Name (Arabic) is required"),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string(),
  department: z.enum(["men", "women", "kids", "unisex"]),
  sortOrder: z.number().int().min(0),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

const emptyValues: CategoryFormValues = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  imageUrl: "",
  parentId: "",
  department: "unisex",
  sortOrder: 0,
};

const inputCls = "h-10";
const labelRowCls = "flex items-center gap-1.5 mb-1.5";

const textareaCls = cn(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "min-h-20 resize-y"
);

function ImageUploadField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const url = await uploadCategoryIcon(file);
      onChange(url);
    } catch {
      toast.error("Couldn't upload the image. Please try again.", { title: "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Label className={labelRowCls}>
        <ImageIcon className="w-3.5 h-3.5 text-primary" />
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
        disabled={uploading}
        className={cn(
          "w-full h-28 rounded-lg border border-dashed flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 overflow-hidden disabled:opacity-50",
          value && "border-solid p-0"
        )}
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : value ? (
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

export interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a category to edit it; omit/null to add a new one. Same dialog handles both. */
  category?: AdminCategory | null;
  /** Top-level categories eligible as a parent. */
  parentOptions: { id: string; name: string }[];
  onSubmit: (values: CategoryFormValues, editingId: string | null) => void;
}

export default function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  parentOptions,
  onSubmit,
}: CategoryFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyValues,
  });

  // Re-seed the form whenever a different category is opened for edit (or the dialog reopens in add mode).
  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      category
        ? {
            nameEn: category.nameEn,
            nameAr: category.nameAr ?? "",
            descriptionEn: category.descriptionEn ?? "",
            descriptionAr: category.descriptionAr ?? "",
            imageUrl: category.imageUrl ?? "",
            parentId: category.parentId ?? "",
            department: category.department,
            sortOrder: category.sortOrder,
          }
        : emptyValues
    );
  }, [open, category, reset]);

  const imagePreview = watch("imageUrl") ?? "";

  function submit(values: CategoryFormValues) {
    onSubmit(values, category?.id ?? null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-3xl min-h-[440px] max-h-[85vh]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FolderTree className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>
              {isEdit ? t("categories.dialog.editTitle") : t("categories.dialog.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t("categories.dialog.editDescription", { name: category!.nameEn })
                : t("categories.dialog.addDescription")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-5">
            {/* Name EN / AR */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  {t("categories.dialog.nameEnglish")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("categories.dialog.nameEnglishPlaceholder")}
                  {...register("nameEn")}
                />
                {errors.nameEn && (
                  <p className="text-xs text-destructive mt-1">{errors.nameEn.message}</p>
                )}
              </div>

              <div>
                <Label className={labelRowCls}>
                  {t("categories.dialog.nameArabic")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("categories.dialog.nameArabicPlaceholder")}
                  dir="rtl"
                  {...register("nameAr")}
                />
                {errors.nameAr && (
                  <p className="text-xs text-destructive mt-1">{errors.nameAr.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Description EN */}
              <div>
                <Label className={labelRowCls}>{t("categories.dialog.descriptionEnglish")}</Label>
                <textarea
                  className={textareaCls}
                  placeholder={t("categories.dialog.descriptionEnglishPlaceholder")}
                  {...register("descriptionEn")}
                />
              </div>

              {/* Description AR */}
              <div>
                <Label className={labelRowCls}>{t("categories.dialog.descriptionArabic")}</Label>
                <textarea
                  className={textareaCls}
                  placeholder={t("categories.dialog.descriptionArabicPlaceholder")}
                  dir="rtl"
                  {...register("descriptionAr")}
                />
              </div>
            </div>

            {/* Category Image */}
            <ImageUploadField
              label={t("categories.dialog.categoryIcon")}
              value={imagePreview}
              placeholder={t("categories.dialog.chooseIcon")}
              onChange={(url) => setValue("imageUrl", url, { shouldValidate: true })}
            />

            {/* Parent + Department + Order */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  {t("categories.dialog.parentCategory")}
                </Label>
                <select
                  className={cn(
                    inputCls,
                    "w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                  )}
                  {...register("parentId")}
                >
                  <option value="">{t("categories.dialog.topLevel")}</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className={labelRowCls}>
                  <Users2 className="w-3.5 h-3.5 text-primary" />
                  {t("categories.dialog.department")}
                </Label>
                <select
                  className={cn(
                    inputCls,
                    "w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                  )}
                  {...register("department")}
                >
                  <option value="unisex">{t("common.departments.unisex")}</option>
                  <option value="men">{t("common.departments.men")}</option>
                  <option value="women">{t("common.departments.women")}</option>
                  <option value="kids">{t("common.departments.kids")}</option>
                </select>
              </div>

              <div>
                <Label className={labelRowCls}>
                  <ListOrdered className="w-3.5 h-3.5 text-primary" />
                  {t("categories.dialog.displayOrder")}
                </Label>
                <Input
                  className={inputCls}
                  type="number"
                  min={0}
                  {...register("sortOrder", { valueAsNumber: true })}
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("categories.dialog.close")}
            </Button>
            <Button type="submit">
              {isEdit ? t("categories.dialog.save") : t("categories.dialog.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
