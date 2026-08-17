/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, ChevronDown } from "lucide-react";

import type { RootState } from "@/store";
import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

// ── Shared primitives ──────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

function SelectField({
  label,
  error,
  options,
  className,
  ...props
}: {
  label: string;
  error?: string;
  options: { label: string; value: string }[];
  className?: string;
  [key: string]: any;
}) {
  return (
    <Field label={label} error={error} className={className}>
      <div className="relative">
        <select className={cn(inputCls, "appearance-none cursor-pointer pr-8")} {...props}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    </Field>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 pb-4 border-b">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
}

// ── Combined General + Security schema ──────────────────────────────────────────

const settingsSchema = z
  .object({
    platformName: z.string().min(1, "Required"),
    supportEmail: z.email("Invalid email"),
    supportPhone: z.string().min(1, "Required"),
    language: z.string(),
    timezone: z.string(),
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { t } = useTranslation();
  const userEmail = useSelector((state: RootState) => state.auth.user?.email ?? "");
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      platformName: "LOKAL ",
      supportEmail: "support@example.com",
      supportPhone: "+1 000 000 0000",
      language: "en",
      timezone: "UTC",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function handleSave() {
    formRef.current?.requestSubmit();
  }

  function onSuccess() {
    toast.success(t("settings.savedToast.body"), { title: t("settings.savedToast.title") });
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("settings.topbarTitle")}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("settings.description")}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 h-10 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
        >
          <Save className="w-4 h-4" />
          {t("settings.saveChanges")}
        </button>
      </div>

      {/* Body */}
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSuccess)}
        className="bg-card rounded-xl border p-6 flex flex-col gap-8"
      >
        <input
          type="text"
          autoComplete="username"
          value={userEmail}
          readOnly
          aria-hidden="true"
          tabIndex={-1}
          className="sr-only"
        />

        {/* General */}
        <div>
          <SectionHeader
            title={t("settings.general.title")}
            description={t("settings.general.description")}
          />
          <div className="grid grid-cols-2 gap-5">
            <Field
              label={t("settings.general.platformName")}
              error={errors.platformName?.message}
              className="col-span-2"
            >
              <input className={inputCls} {...register("platformName")} />
            </Field>

            <Field label={t("settings.general.supportEmail")} error={errors.supportEmail?.message}>
              <input type="email" className={inputCls} {...register("supportEmail")} />
            </Field>

            <Field label={t("settings.general.supportPhone")} error={errors.supportPhone?.message}>
              <input className={inputCls} {...register("supportPhone")} />
            </Field>

            <SelectField
              label={t("settings.general.defaultLanguage")}
              options={[
                { label: t("settings.general.languages.english"), value: "en" },
                { label: t("settings.general.languages.arabic"), value: "ar" },
                { label: t("settings.general.languages.french"), value: "fr" },
                { label: t("settings.general.languages.spanish"), value: "es" },
              ]}
              {...register("language")}
            />

            <SelectField
              label={t("settings.general.timezone")}
              options={[
                { label: "UTC (GMT+0)", value: "UTC" },
                { label: "Asia/Riyadh (GMT+3)", value: "Asia/Riyadh" },
                { label: "Asia/Dubai (GMT+4)", value: "Asia/Dubai" },
                { label: "Europe/London (GMT+1)", value: "Europe/London" },
                { label: "America/New_York (GMT-5)", value: "America/New_York" },
              ]}
              {...register("timezone")}
            />
          </div>
        </div>

        {/* Security */}
        <div>
          <SectionHeader
            title={t("settings.security.title")}
            description={t("settings.security.description")}
          />
          <div className="grid grid-cols-2 gap-5">
            <Field
              label={t("settings.security.currentPassword")}
              error={errors.currentPassword?.message}
              className="col-span-2"
            >
              <input
                type="password"
                className={inputCls}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("currentPassword")}
              />
            </Field>

            <Field label={t("settings.security.newPassword")} error={errors.newPassword?.message}>
              <input
                type="password"
                className={inputCls}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("newPassword")}
              />
            </Field>

            <Field
              label={t("settings.security.confirmPassword")}
              error={errors.confirmPassword?.message}
            >
              <input
                type="password"
                className={inputCls}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </Field>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
