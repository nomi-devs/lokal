import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogBody, DialogFooter } from "@/components/ui/dialog";
import DialogIconHeader from "@/components/ui/DialogIconHeader";
import type { Product } from "@/lib/productsApi";

const rejectSchema = z.object({
  rejectionReason: z.string().min(5).max(500),
});
type RejectValues = z.infer<typeof rejectSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onReject: (rejectionReason: string) => void;
}

export default function ProductRejectDialog({ open, onOpenChange, product, onReject }: Props) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { rejectionReason: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ rejectionReason: "" });
    }
  }, [open, product, reset]);

  if (!product) {
    return null;
  }

  function submit(values: RejectValues) {
    onReject(values.rejectionReason);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md min-h-[280px] max-h-[70vh]">
        <DialogIconHeader
          icon={XCircle}
          title={t("products.reject.title")}
          description={t("products.reject.description", { name: product.name.en })}
        />

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            <div>
              <Label className="mb-1.5 block">{t("products.reject.reasonLabel")}</Label>
              <Textarea
                placeholder={t("products.reject.reasonPlaceholder")}
                {...register("rejectionReason")}
              />
              {errors.rejectionReason && (
                <p className="text-xs text-destructive mt-1">
                  {t("products.reject.errors.reasonRequired")}
                </p>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("products.reject.cancel")}
            </Button>
            <Button type="submit" variant="destructive">
              <XCircle className="w-4 h-4" />
              {t("products.reject.reject")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
