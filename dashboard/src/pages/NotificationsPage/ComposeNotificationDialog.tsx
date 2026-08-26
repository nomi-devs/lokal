import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Bell, Send } from "lucide-react";

import type { AdminVendorRow } from "@/lib/adminApi";
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

// Backend support is vendor-only (POST /admin/notifications/vendor) — an
// empty vendorId broadcasts to every vendor instead of targeting one.
const composeSchema = z.object({
  vendorId: z.string(),
  title: z.string().min(1, "Title is required"),
  titleAr: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  messageAr: z.string().optional(),
});

export type ComposeFormValues = z.infer<typeof composeSchema>;

const emptyValues: ComposeFormValues = {
  vendorId: "",
  title: "",
  titleAr: "",
  message: "",
  messageAr: "",
};

const labelCls = "mb-1.5";

export interface ComposeNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors: AdminVendorRow[];
  onSubmit: (values: ComposeFormValues) => void;
}

export default function ComposeNotificationDialog({
  open,
  onOpenChange,
  vendors,
  onSubmit,
}: ComposeNotificationDialogProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComposeFormValues>({
    resolver: zodResolver(composeSchema),
    defaultValues: emptyValues,
  });

  // Reset the form every time the dialog is (re)opened for a fresh compose.
  useEffect(() => {
    if (open) {
      reset(emptyValues);
    }
  }, [open, reset]);

  function submit(values: ComposeFormValues) {
    onSubmit(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 min-h-[420px] max-h-[85vh]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>{t("notificationsSend.compose.title")}</DialogTitle>
            <DialogDescription>{t("notificationsSend.compose.description")}</DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            <div>
              <Label className={labelCls}>{t("notificationsSend.compose.recipient")}</Label>
              <Select className="cursor-pointer" {...register("vendorId")}>
                <option value="">{t("notificationsSend.compose.allVendors")}</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.storeName}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label className={labelCls}>
                {t("notificationsSend.compose.titleLabel")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-10"
                placeholder={t("notificationsSend.compose.titlePlaceholder")}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label className={labelCls}>{t("notificationsSend.compose.titleArLabel")}</Label>
              <Input className="h-10" dir="rtl" {...register("titleAr")} />
            </div>

            <div>
              <Label className={labelCls}>
                {t("notificationsSend.compose.messageLabel")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={4}
                placeholder={t("notificationsSend.compose.messagePlaceholder")}
                className="resize-none"
                {...register("message")}
              />
              {errors.message && (
                <p className="text-xs text-destructive mt-1">{errors.message.message}</p>
              )}
            </div>

            <div>
              <Label className={labelCls}>{t("notificationsSend.compose.messageArLabel")}</Label>
              <Textarea rows={3} dir="rtl" className="resize-none" {...register("messageAr")} />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit">
              <Send className="w-4 h-4" />
              {t("notificationsSend.compose.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
