import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
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

const rejectSchema = z.object({
  rejectionCategory: z.string().min(1, "Select a category"),
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});
type RejectValues = z.infer<typeof rejectSchema>;

const textareaCls = cn(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "min-h-24 resize-y"
);

const selectCls =
  "h-10 w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: { id: string; storeName: string } | null;
  onReject: (vendorId: string, rejectionReason: string, rejectionCategory: string) => void;
}

export default function VendorRejectDialog({ open, onOpenChange, vendor, onReject }: Props) {
  const { t } = useTranslation();

  const rejectionCategories = [
    { value: "expired", label: t("vendors.rejectModal.categories.expired") },
    { value: "invalid", label: t("vendors.rejectModal.categories.invalid") },
    { value: "incomplete", label: t("vendors.rejectModal.categories.incomplete") },
    { value: "fraud", label: t("vendors.rejectModal.categories.fraud") },
  ] as const;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { rejectionCategory: "", rejectionReason: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ rejectionCategory: "", rejectionReason: "" });
    }
  }, [open, vendor, reset]);

  if (!vendor) {
    return null;
  }

  function submit(values: RejectValues) {
    onReject(vendor!.id, values.rejectionReason, values.rejectionCategory);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md min-h-[320px] max-h-[70vh]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <div className="min-w-0">
            <DialogTitle>{t("vendors.rejectModal.title")}</DialogTitle>
            <DialogDescription>
              {t("vendors.rejectModal.description", { storeName: vendor.storeName })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            <div>
              <Label className="mb-1.5 block">{t("vendors.rejectModal.categoryLabel")}</Label>
              <select className={selectCls} {...register("rejectionCategory")}>
                <option value="">{t("vendors.rejectModal.selectReason")}</option>
                {rejectionCategories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.rejectionCategory && (
                <p className="text-xs text-destructive mt-1">
                  {t("vendors.rejectModal.errors.categoryRequired")}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1.5 block">
                {t("vendors.rejectModal.detailsLabel")} <span className="text-destructive">*</span>
              </Label>
              <textarea
                className={textareaCls}
                placeholder={t("vendors.rejectModal.detailsPlaceholder")}
                {...register("rejectionReason")}
              />
              {errors.rejectionReason && (
                <p className="text-xs text-destructive mt-1">
                  {t("vendors.rejectModal.errors.reasonRequired")}
                </p>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("vendors.rejectModal.cancel")}
            </Button>
            <Button type="submit" variant="destructive">
              <XCircle className="w-4 h-4" />
              {t("vendors.rejectModal.reject")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
