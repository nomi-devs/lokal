import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { KeyRound, Eye, EyeOff } from "lucide-react";

import type { User } from "@/data/users";
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

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm the password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const labelCls = "flex items-center gap-1.5 mb-1.5 text-sm font-medium";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (password: string, id: number) => void;
}

export default function UserPasswordDialog({ open, onOpenChange, user, onSubmit }: Props) {
  const { t } = useTranslation();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({ password: "", confirmPassword: "" });
    setShowPw(false);
    setShowConfirm(false);
  }, [open, reset]);

  function submit(values: FormValues) {
    if (!user) {
      return;
    }

    onSubmit(values.password, user.id);
    onOpenChange(false);
  }

  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-amber-500" />
          </div>
          <div className="min-w-0">
            <DialogTitle>{t("users.view.changePasswordTitle")}</DialogTitle>
            <DialogDescription>{t("users.view.changePasswordDesc", { name })}</DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            <div>
              <Label className={labelCls}>
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                {t("users.dialog.password")} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  className="h-10 pr-10"
                  type={showPw ? "text" : "password"}
                  placeholder={t("users.dialog.passwordPlaceholder")}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label className={labelCls}>
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                {t("vendors.dialog.confirmPassword")} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  className="h-10 pr-10"
                  type={showConfirm ? "text" : "password"}
                  placeholder={t("vendors.dialog.confirmPasswordPlaceholder")}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
              <KeyRound className="w-4 h-4" />
              {t("vendors.dialog.changePasswordButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
