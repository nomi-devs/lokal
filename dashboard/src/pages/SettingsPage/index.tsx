/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Bell, ShieldCheck, Paintbrush, Save, ChevronDown } from "lucide-react";
import type { RefObject, ReactElement } from "react";

import type { RootState } from "@/store";
import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

// ── Tabs ───────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "appearance", label: "Appearance", icon: Paintbrush },
] as const;

type TabId = (typeof TABS)[number]["id"];

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

// ── General ────────────────────────────────────────────────────────────────────

const generalSchema = z.object({
  platformName: z.string().min(1, "Required"),
  supportEmail: z.email("Invalid email"),
  supportPhone: z.string().min(1, "Required"),
  language: z.string(),
  timezone: z.string(),
  currency: z.string(),
});

function GeneralSettings({
  formRef,
  onSuccess,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      platformName: "Dashboard Kit",
      supportEmail: "support@example.com",
      supportPhone: "+1 000 000 0000",
      language: "en",
      timezone: "UTC",
      currency: "USD",
    },
  });

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSuccess)}>
      <SectionHeader title="General Settings" description="Configure basic platform information" />
      <div className="grid grid-cols-2 gap-5">
        <Field label="Platform Name" error={errors.platformName?.message} className="col-span-2">
          <input className={inputCls} {...register("platformName")} />
        </Field>

        <Field label="Support Email" error={errors.supportEmail?.message}>
          <input type="email" className={inputCls} {...register("supportEmail")} />
        </Field>

        <Field label="Support Phone" error={errors.supportPhone?.message}>
          <input className={inputCls} {...register("supportPhone")} />
        </Field>

        <SelectField
          label="Default Language"
          options={[
            { label: "English", value: "en" },
            { label: "Arabic", value: "ar" },
            { label: "French", value: "fr" },
            { label: "Spanish", value: "es" },
          ]}
          {...register("language")}
        />

        <SelectField
          label="Timezone"
          options={[
            { label: "UTC (GMT+0)", value: "UTC" },
            { label: "Asia/Riyadh (GMT+3)", value: "Asia/Riyadh" },
            { label: "Asia/Dubai (GMT+4)", value: "Asia/Dubai" },
            { label: "Europe/London (GMT+1)", value: "Europe/London" },
            { label: "America/New_York (GMT-5)", value: "America/New_York" },
          ]}
          {...register("timezone")}
        />

        <SelectField
          label="Currency"
          className="col-span-2"
          options={[
            { label: "USD — US Dollar", value: "USD" },
            { label: "SAR — Saudi Riyal", value: "SAR" },
            { label: "EUR — Euro", value: "EUR" },
            { label: "GBP — British Pound", value: "GBP" },
            { label: "AED — UAE Dirham", value: "AED" },
          ]}
          {...register("currency")}
        />
      </div>
    </form>
  );
}

// ── Notifications ──────────────────────────────────────────────────────────────

const notifSchema = z.object({
  emailNotifs: z.string(),
  pushNotifs: z.string(),
  digestFrequency: z.string(),
  alertEmail: z.email("Invalid email"),
});

function NotificationSettings({
  formRef,
  onSuccess,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(notifSchema),
    defaultValues: {
      emailNotifs: "enabled",
      pushNotifs: "enabled",
      digestFrequency: "daily",
      alertEmail: "alerts@example.com",
    },
  });

  const toggleOptions = [
    { label: "Enabled", value: "enabled" },
    { label: "Disabled", value: "disabled" },
  ];

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSuccess)}>
      <SectionHeader
        title="Notification Settings"
        description="Control how and when notifications are delivered"
      />
      <div className="grid grid-cols-2 gap-5">
        <SelectField
          label="Email Notifications"
          options={toggleOptions}
          {...register("emailNotifs")}
        />

        <SelectField
          label="Push Notifications"
          options={toggleOptions}
          {...register("pushNotifs")}
        />

        <SelectField
          label="Digest Frequency"
          className="col-span-2"
          options={[
            { label: "Real-time", value: "realtime" },
            { label: "Hourly", value: "hourly" },
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
          ]}
          {...register("digestFrequency")}
        />

        <Field label="Alert Email" error={errors.alertEmail?.message} className="col-span-2">
          <input type="email" className={inputCls} {...register("alertEmail")} />
        </Field>
      </div>
    </form>
  );
}

// ── Security ───────────────────────────────────────────────────────────────────

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
    sessionTimeout: z.string(),
    twoFactor: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function SecuritySettings({
  formRef,
  onSuccess,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  onSuccess: () => void;
}) {
  const userEmail = useSelector((state: RootState) => state.auth.user?.email ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      sessionTimeout: "30",
      twoFactor: "disabled",
    },
  });

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSuccess)}>
      <input
        type="text"
        autoComplete="username"
        value={userEmail}
        readOnly
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
      />
      <SectionHeader
        title="Security Settings"
        description="Manage account security and authentication"
      />
      <div className="grid grid-cols-2 gap-5">
        <Field
          label="Current Password"
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

        <Field label="New Password" error={errors.newPassword?.message}>
          <input
            type="password"
            className={inputCls}
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("newPassword")}
          />
        </Field>

        <Field label="Confirm Password" error={errors.confirmPassword?.message}>
          <input
            type="password"
            className={inputCls}
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </Field>

        <SelectField
          label="Session Timeout"
          options={[
            { label: "15 minutes", value: "15" },
            { label: "30 minutes", value: "30" },
            { label: "1 hour", value: "60" },
            { label: "4 hours", value: "240" },
            { label: "Never", value: "0" },
          ]}
          {...register("sessionTimeout")}
        />

        <SelectField
          label="Two-Factor Authentication"
          options={[
            { label: "Disabled", value: "disabled" },
            { label: "Email OTP", value: "email" },
            { label: "Authenticator App", value: "app" },
          ]}
          {...register("twoFactor")}
        />
      </div>
    </form>
  );
}

// ── Appearance ─────────────────────────────────────────────────────────────────

const appearanceSchema = z.object({
  theme: z.string(),
  direction: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  fontSize: z.string(),
});

function AppearanceSettings({
  formRef,
  onSuccess,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  onSuccess: () => void;
}) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      theme: "light",
      direction: "ltr",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      fontSize: "medium",
    },
  });

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSuccess)}>
      <SectionHeader
        title="Appearance Settings"
        description="Customize the look and feel of the platform"
      />
      <div className="grid grid-cols-2 gap-5">
        <SelectField
          label="Theme"
          options={[
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
            { label: "System", value: "system" },
          ]}
          {...register("theme")}
        />

        <SelectField
          label="Text Direction"
          options={[
            { label: "Left to Right (LTR)", value: "ltr" },
            { label: "Right to Left (RTL)", value: "rtl" },
          ]}
          {...register("direction")}
        />

        <SelectField
          label="Date Format"
          options={[
            { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
            { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
            { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
          ]}
          {...register("dateFormat")}
        />

        <SelectField
          label="Time Format"
          options={[
            { label: "12-hour (AM/PM)", value: "12h" },
            { label: "24-hour", value: "24h" },
          ]}
          {...register("timeFormat")}
        />

        <SelectField
          label="Font Size"
          className="col-span-2"
          options={[
            { label: "Small", value: "small" },
            { label: "Medium (default)", value: "medium" },
            { label: "Large", value: "large" },
          ]}
          {...register("fontSize")}
        />
      </div>
    </form>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

const TAB_CONTENT: Record<
  TabId,
  (props: { formRef: RefObject<HTMLFormElement | null>; onSuccess: () => void }) => ReactElement
> = {
  general: GeneralSettings,
  notifications: NotificationSettings,
  security: SecuritySettings,
  appearance: AppearanceSettings,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const formRef = useRef<HTMLFormElement>(null);

  function handleSave() {
    formRef.current?.requestSubmit();
  }

  function onSuccess() {
    toast.success("Your changes have been saved.", { title: "Settings Saved" });
  }

  const ActiveSection = TAB_CONTENT[activeTab];

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle="Settings">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage platform configuration and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 h-10 px-5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Body */}
      <div className="flex gap-5 items-start">
        {/* Sidebar */}
        <div className="w-52 shrink-0 bg-card rounded-xl border p-2 flex flex-col gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-start",
                activeTab === tab.id
                  ? "bg-[#1e2d3d] text-white dark:bg-primary dark:text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-card rounded-xl border p-6">
          <ActiveSection formRef={formRef} onSuccess={onSuccess} />
        </div>
      </div>
    </DashboardLayout>
  );
}
