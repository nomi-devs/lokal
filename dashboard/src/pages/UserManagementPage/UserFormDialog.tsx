import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  UserPlus,
  Mail,
  Phone,
  User,
  Shield,
  Calendar,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";

import type { User as UserType } from "@/data/users";
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

const userSchema = z.object({
  email: z.string().email("Valid email is required").or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters").or(z.literal("")),
  role: z.enum(["user", "vendor", "admin"]),
  language: z.enum(["en", "ar"]),
  gender: z.enum(["Male", "Female", "Other", ""]).optional(),
  birthday: z.string().optional(),
  profilePicture: z.string().optional(),
  profileBackground: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]),
});

export type UserFormValues = z.infer<typeof userSchema>;

const emptyValues: UserFormValues = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  username: "",
  password: "",
  role: "user",
  language: "en",
  gender: "",
  birthday: "",
  profilePicture: "",
  profileBackground: "",
  status: "active",
};

const inputCls = "h-10";
const labelRowCls = "flex items-center gap-1.5 mb-1.5 text-sm font-medium";

export interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserType | null;
  onSubmit: (values: UserFormValues, editingId: number | null) => void;
}

export default function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!user;
  const picRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [picUrl, setPicUrl] = useState<string | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      user
        ? {
            email: user.email ?? "",
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName ?? "",
            username: user.username ?? "",
            password: "",
            role: user.role,
            language: user.language,
            gender: user.gender ?? "",
            birthday: user.birthday ?? "",
            profilePicture: user.profilePicture ?? "",
            profileBackground: user.profileBackground ?? "",
            status: user.status,
          }
        : emptyValues
    );
    setPicUrl(user?.profilePicture ?? null);
    setBgUrl(user?.profileBackground ?? null);
  }, [open, user, reset]);

  function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    field: "profilePicture" | "profileBackground"
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    setter(url);
    setValue(field, url);
  }

  function submit(values: UserFormValues) {
    onSubmit(values, user?.id ?? null);
    onOpenChange(false);
  }

  const selectCls = cn(
    inputCls,
    "w-full rounded-md border bg-transparent px-3 text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle>
              {isEdit ? t("users.dialog.editTitle") : t("users.dialog.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? t("users.dialog.editDescription", { id: user!.id })
                : t("users.dialog.addDescription")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="contents">
          <DialogBody className="flex flex-col gap-4">
            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  {t("users.dialog.email")}
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("users.dialog.emailPlaceholder")}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label className={labelRowCls}>
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  {t("users.dialog.phone")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("users.dialog.phonePlaceholder")}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* First Name + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <User className="w-3.5 h-3.5 text-primary" />
                  {t("users.dialog.firstName")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("users.dialog.firstNamePlaceholder")}
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label className={labelRowCls}>
                  <User className="w-3.5 h-3.5 text-primary" />
                  {t("users.dialog.lastName")}
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("users.dialog.lastNamePlaceholder")}
                  {...register("lastName")}
                />
              </div>
            </div>

            {/* Username + Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <User className="w-3.5 h-3.5 text-primary" />
                  {t("users.dialog.username")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputCls}
                  placeholder={t("users.dialog.usernamePlaceholder")}
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
                )}
              </div>
              <div>
                <Label className={labelRowCls}>
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  {t("users.dialog.password")}{" "}
                  {!isEdit && <span className="text-destructive">*</span>}
                </Label>
                <div className="relative">
                  <Input
                    className={cn(inputCls, "pr-10")}
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      isEdit
                        ? t("users.dialog.passwordEditPlaceholder")
                        : t("users.dialog.passwordPlaceholder")
                    }
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Role + Language */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  {t("users.dialog.role")}
                </Label>
                <select className={selectCls} {...register("role")}>
                  <option value="user">{t("common.status.user")}</option>
                  <option value="vendor">{t("common.status.vendor")}</option>
                  <option value="admin">{t("common.status.admin")}</option>
                </select>
              </div>
              <div>
                <Label className={labelRowCls}>
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  {t("users.dialog.language")}
                </Label>
                <select className={selectCls} {...register("language")}>
                  <option value="en">{t("settings.general.languages.english")}</option>
                  <option value="ar">{t("settings.general.languages.arabic")}</option>
                </select>
              </div>
            </div>

            {/* Gender + Birthday */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>{t("users.dialog.gender")}</Label>
                <select className={selectCls} {...register("gender")}>
                  <option value="">{t("users.dialog.genderSelect")}</option>
                  <option value="Male">{t("users.dialog.genderMale")}</option>
                  <option value="Female">{t("users.dialog.genderFemale")}</option>
                  <option value="Other">{t("users.dialog.genderOther")}</option>
                </select>
              </div>
              <div>
                <Label className={labelRowCls}>
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {t("users.dialog.birthday")}
                </Label>
                <Input className={inputCls} type="date" {...register("birthday")} />
              </div>
            </div>

            {/* Profile Picture + Profile Background */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  {t("users.dialog.profilePicture")}
                </Label>
                <div
                  className="flex items-center gap-2 h-10 rounded-md border px-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => picRef.current?.click()}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs shrink-0"
                  >
                    {t("users.dialog.chooseFile")}
                  </Button>
                  <span className="text-sm text-muted-foreground truncate">
                    {picUrl ? t("users.dialog.fileChosen") : t("users.dialog.noFileChosen")}
                  </span>
                </div>
                <input
                  ref={picRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e, setPicUrl, "profilePicture")}
                />
              </div>
              <div>
                <Label className={labelRowCls}>
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  {t("users.dialog.profileBackground")}
                </Label>
                <div
                  className="flex items-center gap-2 h-10 rounded-md border px-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => bgRef.current?.click()}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs shrink-0"
                  >
                    {t("users.dialog.chooseFile")}
                  </Button>
                  <span className="text-sm text-muted-foreground truncate">
                    {bgUrl ? t("users.dialog.fileChosen") : t("users.dialog.noFileChosen")}
                  </span>
                </div>
                <input
                  ref={bgRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e, setBgUrl, "profileBackground")}
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <Label className={labelRowCls + " mb-0"}>{t("users.dialog.activeStatus")}</Label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={watch("status") === "active"}
                  onChange={(e) => setValue("status", e.target.checked ? "active" : "suspended")}
                />
                <div className="w-11 h-6 bg-muted peer-checked:bg-primary rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("users.dialog.cancel")}
            </Button>
            <Button type="submit">
              <UserPlus className="w-4 h-4" />
              {isEdit ? t("users.dialog.saveButton") : t("users.dialog.addButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
