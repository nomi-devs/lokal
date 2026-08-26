import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  Save,
  Store,
  Image as ImageIcon,
  Mail,
  Phone,
  MapPin,
  User,
  Percent,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Star,
  KeyRound,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import { vendorSidebarItems } from "@/constants";
import { toast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Badge, { type BadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RootState } from "@/store";
import { getApiErrorMessage } from "@/lib/apiClient";
import { changePassword } from "@/lib/usersApi";
import {
  getMyVendor,
  updateVendorProfile,
  uploadVendorLogo,
  type VendorProfile,
} from "@/lib/vendorsApi";
import { getCommission } from "@/lib/commissionApi";

const storeSchema = z.object({
  description: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
});

type StoreFormValues = z.infer<typeof storeSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm the new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const inputCls = "h-10";
const labelRowCls = "flex items-center gap-1.5 mb-1.5";
const cardCls = "bg-card rounded-xl border p-6 flex flex-col gap-5";
const sectionTitleCls = "flex items-center gap-2 text-sm font-semibold";

const approvalVariant: Record<VendorProfile["status"], BadgeVariant> = {
  pending_approval: "warning",
  active: "success",
  inactive: "neutral",
  suspended: "danger",
};

function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Store;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className="text-sm font-semibold">{value || "—"}</span>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function VendorStore() {
  const { t } = useTranslation();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [commissionPercentage, setCommissionPercentage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");
  const [initialLogoUrl, setInitialLogoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: { description: "", phone: "", address: "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    let cancelled = false;

    getMyVendor()
      .then((v) => {
        if (cancelled) {
          return;
        }

        setVendor(v);
        setLogoUrl(v.logoUrl ?? "");
        setInitialLogoUrl(v.logoUrl ?? "");
        reset({
          description: v.storeDescription ?? "",
          phone: v.phone ?? "",
          address: v.address ?? "",
        });
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Couldn't load your store profile"), {
          title: "Load failed",
        });
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    // Platform-wide rate, not per-vendor — see local-be's CommissionController.
    getCommission()
      .then((c) => {
        if (!cancelled) {
          setCommissionPercentage(c.percentage);
        }
      })
      .catch(() => {
        // Non-critical for this page — the field below just stays blank.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingLogo(true);
    try {
      const url = await uploadVendorLogo(file);
      setLogoUrl(url);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't upload the logo"), {
        title: "Upload failed",
      });
    } finally {
      setUploadingLogo(false);
    }
  }

  async function onSubmit(values: StoreFormValues) {
    setIsSaving(true);
    try {
      const updated = await updateVendorProfile({
        storeDescription: values.description,
        phone: values.phone,
        address: values.address,
        logoUrl: logoUrl || undefined,
      });
      setVendor(updated);
      setInitialLogoUrl(logoUrl);
      reset(values);
      toast.success(t("vendor.profile.savedToast.body"), {
        title: t("vendor.profile.savedToast.title"),
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't save your profile"), {
        title: "Save failed",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function onPasswordSubmit(values: PasswordFormValues) {
    setIsChangingPassword(true);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success(t("vendor.profile.security.updatedToast.body"), {
        title: t("vendor.profile.security.updatedToast.title"),
      });
      resetPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowCurrentPw(false);
      setShowNewPw(false);
      setShowConfirmPw(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't change your password"), {
        title: t("vendor.profile.security.failedToast.title"),
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  const ownerName = authUser ? `${authUser.firstName} ${authUser.lastName}`.trim() : undefined;

  return (
    <DashboardLayout
      sidebarItems={vendorSidebarItems}
      topbarTitle={t("vendor.profile.topbarTitle")}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("vendor.profile.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("vendor.profile.description")}</p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-5">
            {/* Business info (editable) */}
            <form onSubmit={handleSubmit(onSubmit)} className={cardCls}>
              <h2 className={sectionTitleCls}>
                <Store className="w-4 h-4 text-primary" />
                {t("vendor.profile.sections.generalInfo")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-5">
                {/* Logo */}
                <div>
                  <Label className={labelRowCls}>
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    {t("vendor.profile.fields.logo")}
                  </Label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className={cn(
                      "w-28 h-28 rounded-lg border border-dashed flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 overflow-hidden",
                      logoUrl && "border-solid p-0"
                    )}
                  >
                    {uploadingLogo ? (
                      <span className="text-xs">…</span>
                    ) : logoUrl ? (
                      <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Store name (read-only — fixed at registration) */}
                <div className="self-start">
                  <Label className={labelRowCls}>{t("vendor.profile.fields.storeName")}</Label>
                  <Input className={inputCls} value={vendor?.storeName ?? ""} disabled />
                  <div>
                    <Label className={labelRowCls}>{t("vendor.profile.fields.description")}</Label>
                    <Textarea className="min-h-14" {...register("description")} />
                  </div>
                </div>
              </div>

              {/* Description */}

              {/* Phone / Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className={labelRowCls}>
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    {t("vendor.profile.fields.phone")}
                  </Label>
                  <Input className={inputCls} {...register("phone")} />
                  {errors.phone && (
                    <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label className={labelRowCls}>
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {t("vendor.profile.fields.address")}
                  </Label>
                  <Input className={inputCls} {...register("address")} />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  size="lg"
                  className="shrink-0"
                  disabled={isSaving || (!isDirty && logoUrl === initialLogoUrl)}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "…" : t("vendor.profile.save")}
                </Button>
              </div>
            </form>

            {/* Change password */}
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className={cardCls}>
              <h2 className={sectionTitleCls}>
                <KeyRound className="w-4 h-4 text-primary" />
                {t("vendor.profile.security.title")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className={labelRowCls}>
                    {t("vendor.profile.security.currentPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      className={cn(inputCls, "pr-10")}
                      type={showCurrentPw ? "text" : "password"}
                      autoComplete="current-password"
                      {...registerPassword("currentPassword")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCurrentPw((v) => !v)}
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-destructive mt-1">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className={labelRowCls}>{t("vendor.profile.security.newPassword")}</Label>
                  <div className="relative">
                    <Input
                      className={cn(inputCls, "pr-10")}
                      type={showNewPw ? "text" : "password"}
                      autoComplete="new-password"
                      {...registerPassword("newPassword")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPw((v) => !v)}
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-destructive mt-1">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className={labelRowCls}>
                    {t("vendor.profile.security.confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      className={cn(inputCls, "pr-10")}
                      type={showConfirmPw ? "text" : "password"}
                      autoComplete="new-password"
                      {...registerPassword("confirmPassword")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPw((v) => !v)}
                    >
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Button type="submit" size="lg" className="w-fit" disabled={isChangingPassword}>
                  <KeyRound className="w-4 h-4" />
                  {isChangingPassword ? "…" : t("vendor.profile.security.updateButton")}
                </Button>
              </div>
            </form>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-5">
            {/* Account status (read-only) */}
            <div className={cardCls}>
              <div className="flex items-center justify-between">
                <h2 className={sectionTitleCls}>
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  {t("vendor.profile.sections.accountStatus")}
                </h2>
                {vendor && (
                  <Badge variant={approvalVariant[vendor.status]} dot>
                    {t(`common.status.${vendor.status}`, vendor.status.replace("_", " "))}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <InfoField
                  icon={User}
                  label={t("vendor.profile.fields.ownerName")}
                  value={ownerName}
                />
                <InfoField
                  icon={Mail}
                  label={t("vendor.profile.fields.ownerEmail")}
                  value={authUser?.email}
                />
                <InfoField
                  icon={MapPin}
                  label={t("vendor.profile.fields.city")}
                  value={vendor?.city}
                />
                <InfoField
                  icon={Percent}
                  label={t("vendor.profile.fields.commission")}
                  value={commissionPercentage !== null ? `${commissionPercentage}%` : undefined}
                />
                <InfoField
                  icon={Calendar}
                  label={t("vendor.profile.fields.memberSince")}
                  value={formatDate(vendor?.createdAt)}
                />
                {vendor?.approvedAt && (
                  <InfoField
                    icon={CheckCircle2}
                    label={t("vendor.profile.fields.approvedOn")}
                    value={formatDate(vendor.approvedAt)}
                  />
                )}
                {vendor && vendor.totalReviews > 0 && (
                  <InfoField
                    icon={Star}
                    label={t("vendor.profile.fields.rating")}
                    value={
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {vendor.rating}
                      </span>
                    }
                  />
                )}
              </div>
            </div>

            {/* Verification (read-only) */}
            {vendor?.kycDocumentUrl && (
              <div className={cardCls}>
                <h2 className={sectionTitleCls}>
                  <FileText className="w-4 h-4 text-primary" />
                  {t("vendor.profile.sections.verification")}
                </h2>
                <div className="flex items-center justify-between px-3 py-2 text-sm border rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{t("vendor.profile.fields.kycDocument")}</span>
                  </div>
                  <a
                    href={vendor.kycDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
