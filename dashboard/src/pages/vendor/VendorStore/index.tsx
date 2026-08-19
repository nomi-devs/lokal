import { useRef, useState } from "react";
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
  Tag,
  Percent,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Star,
  KeyRound,
  Eye,
  EyeOff,
  Landmark,
  ExternalLink,
} from "lucide-react";

import { DashboardLayout } from "@/components/Dashboard";
import { vendorSidebarItems } from "@/constants";
import { toast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { RootState } from "@/store";
import { initialVendors, type VendorStatus } from "@/data/vendors";

const storeSchema = z.object({
  nameEn: z.string().min(1, "Store name (English) is required"),
  nameAr: z.string().min(1, "Store name (Arabic) is required"),
  logoUrl: z.string().optional(),
  description: z.string().optional(),
  email: z.email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
});

type StoreFormValues = z.infer<typeof storeSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
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

const textareaCls = cn(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "min-h-24 resize-y"
);

const approvalStyle: Record<VendorStatus, { text: string; bg: string; dot: string }> = {
  pending: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    dot: "bg-amber-400",
  },
  approved: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
  },
  rejected: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    dot: "bg-red-500",
  },
  suspended: { text: "text-muted-foreground", bg: "bg-muted", dot: "bg-slate-400" },
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
  const vendorId = useSelector((state: RootState) => state.auth.user?.vendorId ?? 0);
  const vendor = initialVendors.find((v) => v.id === vendorId);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      nameEn: vendor?.nameEn ?? "",
      nameAr: vendor?.nameAr ?? "",
      logoUrl: vendor?.logoUrl ?? "",
      description: vendor?.description ?? "",
      email: vendor?.email ?? "",
      phone: vendor?.phone ?? "",
      address: vendor?.address ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const logoPreview = watch("logoUrl") ?? "";

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Template placeholder — swap for your upload endpoint and store the returned URL instead.
    const url = URL.createObjectURL(file);

    objectUrlsRef.current.push(url);
    setValue("logoUrl", url, { shouldValidate: true });
  }

  function onSubmit() {
    toast.success(t("vendor.profile.savedToast.body"), {
      title: t("vendor.profile.savedToast.title"),
    });
  }

  function onPasswordSubmit() {
    toast.success(t("vendor.profile.security.updatedToast.body"), {
      title: t("vendor.profile.security.updatedToast.title"),
    });
    resetPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
  }

  return (
    <DashboardLayout
      sidebarItems={vendorSidebarItems}
      topbarTitle={t("vendor.profile.topbarTitle")}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("vendor.profile.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("vendor.profile.description")}</p>
      </div>

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
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className={cn(
                    "w-28 h-28 rounded-lg border border-dashed flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 overflow-hidden",
                    logoPreview && "border-solid p-0"
                  )}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Name EN / AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 self-start">
                <div>
                  <Label className={labelRowCls}>
                    {t("vendor.profile.fields.nameEnglish")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input className={inputCls} {...register("nameEn")} />
                  {errors.nameEn && (
                    <p className="text-xs text-destructive mt-1">{errors.nameEn.message}</p>
                  )}
                </div>
                <div>
                  <Label className={labelRowCls}>
                    {t("vendor.profile.fields.nameArabic")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input className={inputCls} dir="rtl" {...register("nameAr")} />
                  {errors.nameAr && (
                    <p className="text-xs text-destructive mt-1">{errors.nameAr.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className={labelRowCls}>{t("vendor.profile.fields.description")}</Label>
              <textarea className={textareaCls} {...register("description")} />
            </div>

            {/* Email / Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className={labelRowCls}>
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  {t("vendor.profile.fields.email")}
                </Label>
                <Input type="email" className={inputCls} {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
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
            </div>

            {/* Address */}
            <div>
              <Label className={labelRowCls}>
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {t("vendor.profile.fields.address")}
              </Label>
              <Input className={inputCls} {...register("address")} />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-2 h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors shrink-0"
              >
                <Save className="w-4 h-4" />
                {t("vendor.profile.save")}
              </button>
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
              <button
                type="submit"
                className="flex items-center gap-2 h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors w-fit"
              >
                <KeyRound className="w-4 h-4" />
                {t("vendor.profile.security.updateButton")}
              </button>
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
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
                    approvalStyle[vendor.status].text,
                    approvalStyle[vendor.status].bg
                  )}
                >
                  <span
                    className={cn("w-1.5 h-1.5 rounded-full", approvalStyle[vendor.status].dot)}
                  />
                  {t(`common.status.${vendor.status}`, vendor.status)}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
              <InfoField
                icon={User}
                label={t("vendor.profile.fields.ownerName")}
                value={vendor?.ownerName}
              />
              <InfoField
                icon={Tag}
                label={t("vendor.profile.fields.category")}
                value={vendor?.category}
              />
              <InfoField
                icon={MapPin}
                label={t("vendor.profile.fields.city")}
                value={vendor?.city}
              />
              <InfoField
                icon={Percent}
                label={t("vendor.profile.fields.commission")}
                value={
                  vendor &&
                  (vendor.commission.type === "percentage"
                    ? `${vendor.commission.value}%`
                    : `${vendor.commission.value} KWD`)
                }
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
              {vendor?.rating != null && (
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

          {/* Verification & documents (read-only) */}
          <div className={cardCls}>
            <h2 className={sectionTitleCls}>
              <FileText className="w-4 h-4 text-primary" />
              {t("vendor.profile.sections.verification")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
              <InfoField
                icon={ShieldCheck}
                label={t("vendor.profile.fields.businessLicense")}
                value={vendor?.businessLicense}
              />
              <InfoField
                icon={FileText}
                label={t("vendor.profile.fields.taxId")}
                value={vendor?.taxId}
              />
              {vendor?.bankAccount && (
                <>
                  <InfoField
                    icon={Landmark}
                    label={t("vendor.profile.fields.bankName")}
                    value={vendor.bankAccount.bankName}
                  />
                  <InfoField
                    icon={Landmark}
                    label={t("vendor.profile.fields.accountNumber")}
                    value={vendor.bankAccount.accountNumber}
                  />
                </>
              )}
            </div>

            {vendor && vendor.documents.length > 0 && (
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-xs text-muted-foreground">
                  {t("vendor.profile.fields.documents")}
                </span>
                <div className="border rounded-lg divide-y">
                  {vendor.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{doc.type}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground">{doc.uploadedAt}</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
