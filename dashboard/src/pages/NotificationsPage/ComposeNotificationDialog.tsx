import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Bell, Send } from "lucide-react";

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

const composeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  recipients: z.enum(["all", "admins", "users", "editors"]),
  type: z.enum(["Info", "Warning", "Alert", "System"]),
  priority: z.enum(["Normal", "High", "Critical"]),
});

export type ComposeFormValues = z.infer<typeof composeSchema>;

const emptyValues: ComposeFormValues = {
  title: "",
  message: "",
  recipients: "all",
  type: "Info",
  priority: "Normal",
};

const selectCls =
  "h-10 w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring cursor-pointer";
const labelCls = "mb-1.5";

export interface ComposeNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ComposeFormValues) => void;
}

export default function ComposeNotificationDialog({
  open,
  onOpenChange,
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
      <DialogContent className="p-0">
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
              <Label className={labelCls}>
                {t("notificationsSend.compose.messageLabel")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <textarea
                rows={4}
                placeholder={t("notificationsSend.compose.messagePlaceholder")}
                className={cn(
                  "w-full rounded-md border bg-transparent px-3 py-2.5 text-sm resize-none",
                  "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                )}
                {...register("message")}
              />
              {errors.message && (
                <p className="text-xs text-destructive mt-1">{errors.message.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelCls}>{t("notificationsSend.compose.recipients")}</Label>
                <select className={selectCls} {...register("recipients")}>
                  <option value="all">{t("notificationsSend.compose.recipientOptions.all")}</option>
                  <option value="admins">
                    {t("notificationsSend.compose.recipientOptions.admins")}
                  </option>
                  <option value="users">
                    {t("notificationsSend.compose.recipientOptions.users")}
                  </option>
                  <option value="editors">
                    {t("notificationsSend.compose.recipientOptions.editors")}
                  </option>
                </select>
              </div>

              <div>
                <Label className={labelCls}>{t("notificationsSend.compose.type")}</Label>
                <select className={selectCls} {...register("type")}>
                  <option value="Info">{t("common.status.info")}</option>
                  <option value="Warning">{t("common.status.warning")}</option>
                  <option value="Alert">{t("common.status.alert")}</option>
                  <option value="System">{t("common.status.system")}</option>
                </select>
              </div>
            </div>

            <div>
              <Label className={labelCls}>{t("notificationsSend.compose.priority")}</Label>
              <select className={selectCls} {...register("priority")}>
                <option value="Normal">{t("common.status.normal")}</option>
                <option value="High">{t("common.status.high")}</option>
                <option value="Critical">{t("common.status.critical")}</option>
              </select>
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
