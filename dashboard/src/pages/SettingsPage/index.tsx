import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Save, SlidersHorizontal, Headphones, Shield } from "lucide-react";

import { SupportInformationCard } from "./SupportInformationCard";

import { DashboardLayout } from "@/components/Dashboard";
import { sidebarItems } from "@/constants";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiClient";
import { changePassword } from "@/lib/usersApi";
import {
  listAdminSettings,
  updateAdminSetting,
  updateSupportSettings,
  type AdminSetting,
  type SettingCategory,
  type SupportSettingKey,
} from "@/lib/settingsApi";
import { getCommission, updateCommission, type PlatformCommission } from "@/lib/commissionApi";

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

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 pb-4 border-b">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
}

// ── Platform configuration (GET/PATCH /admin/settings) ──────────────────────

const SETTING_CATEGORIES: SettingCategory[] = [
  "general",
  "shipping",
  "commission",
  "payment",
  "sms",
  "auth",
];

function SettingControl({
  setting,
  onChange,
}: {
  setting: AdminSetting;
  onChange: (value: AdminSetting["value"]) => void;
}) {
  if (setting.type === "boolean") {
    return (
      <label className="inline-flex items-center gap-2 h-10">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border accent-primary"
          checked={setting.value === true}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-sm text-muted-foreground">
          {setting.value ? "Enabled" : "Disabled"}
        </span>
      </label>
    );
  }

  if (setting.type === "number") {
    return (
      <input
        type="number"
        className={inputCls}
        value={setting.value as number}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  }

  return (
    <input
      type="text"
      className={inputCls}
      value={String(setting.value)}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ── Security (PUT /users/change-password) ────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

// ── Tabs (tracked via ?tab= so a refresh doesn't revert to "general") ────────

const SETTINGS_TABS = ["general", "support", "security"] as const;
type SettingsTab = (typeof SETTINGS_TABS)[number];

function isSettingsTab(value: string | null): value is SettingsTab {
  return SETTINGS_TABS.includes(value as SettingsTab);
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab: SettingsTab = isSettingsTab(searchParams.get("tab"))
    ? (searchParams.get("tab") as SettingsTab)
    : "general";
  const [loading, setLoading] = useState(true);
  const [platformSettings, setPlatformSettings] = useState<AdminSetting[]>([]);
  const [commission, setCommission] = useState<PlatformCommission | null>(null);
  const [commissionInput, setCommissionInput] = useState("");
  const [commissionLoading, setCommissionLoading] = useState(true);
  const [savingCommission, setSavingCommission] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      setPlatformSettings(await listAdminSettings());
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load settings"));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommission = useCallback(async () => {
    setCommissionLoading(true);
    try {
      const data = await getCommission();
      setCommission(data);
      setCommissionInput(String(data.percentage));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load commission"));
    } finally {
      setCommissionLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchCommission();
  }, [fetchSettings, fetchCommission]);

  async function saveCommission() {
    const value = Number(commissionInput);

    if (Number.isNaN(value) || value < 0 || value > 100) {
      toast.error("Enter a percentage between 0 and 100");

      return;
    }

    setSavingCommission(true);
    try {
      const updated = await updateCommission(value);
      setCommission(updated);
      setCommissionInput(String(updated.percentage));
      toast.success(t("settings.commissionCard.savedToast.body"), {
        title: t("settings.commissionCard.savedToast.title"),
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update commission"));
    } finally {
      setSavingCommission(false);
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function updateSetting(key: string, value: AdminSetting["value"]) {
    const previous = platformSettings;

    setPlatformSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
    try {
      const updated = await updateAdminSetting(key, value);
      setPlatformSettings((prev) => prev.map((s) => (s.key === key ? updated : s)));
    } catch (err) {
      setPlatformSettings(previous);
      toast.error(getApiErrorMessage(err, "Failed to update setting"));
    }
  }

  // Same optimistic-update/revert as updateSetting above, but rethrows on
  // failure instead of self-toasting — SupportInformationCard shows its own
  // combined toast. One PATCH /admin/settings/support call for the whole
  // form (see settingsApi.updateSupportSettings), not one per field.
  async function saveSupportSettings(values: Partial<Record<SupportSettingKey, string>>) {
    const previous = platformSettings;

    setPlatformSettings((prev) =>
      prev.map((s) => (s.key in values ? { ...s, value: values[s.key as SupportSettingKey]! } : s))
    );
    try {
      const updated = await updateSupportSettings(values);
      const updatedByKey = new Map(updated.map((s) => [s.key, s]));
      setPlatformSettings((prev) => prev.map((s) => updatedByKey.get(s.key) ?? s));
    } catch (err) {
      setPlatformSettings(previous);
      throw err;
    }
  }

  async function onChangePassword(values: PasswordValues) {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success(t("settings.savedToast.body"), { title: t("settings.savedToast.title") });
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to change password"));
    }
  }

  function handleTabChange(value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", value);

        return next;
      },
      { replace: true },
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} topbarTitle={t("settings.topbarTitle")}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.description")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="general">
            <SlidersHorizontal className="w-4 h-4" />
            {t("settings.tabs.general")}
          </TabsTrigger>
          <TabsTrigger value="support">
            <Headphones className="w-4 h-4" />
            {t("settings.tabs.support")}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4" />
            {t("settings.tabs.security")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="flex flex-col gap-6 pt-6">
          {/* Commission — driven by GET/PATCH /commission, the one value on this page that's
              actually wired into checkout math (unlike the record-keeping grid below) */}
          <div className="bg-card rounded-xl border p-6">
            <SectionHeader
              title={t("settings.commissionCard.title")}
              description={t("settings.commissionCard.description")}
            />
            {commissionLoading ? (
              <p className="text-sm text-muted-foreground">{t("common.loading", "Loading…")}</p>
            ) : (
              <>
                <div className="flex items-end gap-3">
                  <Field label={t("settings.commissionCard.label")} className="max-w-[200px]">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      className={inputCls}
                      value={commissionInput}
                      onChange={(e) => setCommissionInput(e.target.value)}
                    />
                  </Field>
                  <Button onClick={saveCommission} disabled={savingCommission}>
                    <Save className="w-4 h-4" />
                    {t("settings.commissionCard.save")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {commission?.updatedAt
                    ? t("settings.commissionCard.lastUpdated", {
                        date: new Date(commission.updatedAt).toLocaleString(),
                      })
                    : t("settings.commissionCard.notSetYet")}
                </p>
              </>
            )}
          </div>

          {/* Platform configuration — driven by GET/PATCH /admin/settings, grouped by category */}
          <div className="bg-card rounded-xl border p-6">
            <SectionHeader
              title={t("settings.platformConfig.title")}
              description={t("settings.platformConfig.description")}
            />
            {loading ? (
              <p className="text-sm text-muted-foreground">{t("common.loading", "Loading…")}</p>
            ) : (
              <div className="flex flex-col gap-8">
                {SETTING_CATEGORIES.map((category) => {
                  const rows = platformSettings.filter((s) => s.category === category);

                  if (!rows.length) {
                    return null;
                  }

                  return (
                    <div key={category}>
                      <h3 className="text-sm font-semibold mb-3">
                        {t(`settings.categories.${category}`)}
                      </h3>
                      <div className="grid grid-cols-2 gap-5">
                        {rows.map((setting) => (
                          <Field key={setting.id} label={setting.key} className="col-span-1">
                            <SettingControl
                              setting={setting}
                              onChange={(value) => updateSetting(setting.key, value)}
                            />
                            <p className="text-xs text-muted-foreground">{setting.descriptionEn}</p>
                          </Field>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {platformSettings.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t("settings.platformConfig.empty", "No settings configured yet.")}
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="support" className="pt-6">
          {/* Support Information — driven by GET/PATCH /admin/settings, category "support",
              seeded by settings-seed.service.ts (local-be) */}
          <SupportInformationCard
            settings={platformSettings.filter((s) => s.category === "support")}
            loading={loading}
            onSave={saveSupportSettings}
          />
        </TabsContent>

        <TabsContent value="security" className="pt-6">
          {/* Security */}
          <form
            onSubmit={handleSubmit(onChangePassword)}
            className="bg-card rounded-xl border p-6 flex flex-col gap-6"
          >
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h2 className="text-lg font-bold">{t("settings.security.title")}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("settings.security.description")}
                </p>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4" />
                {t("settings.saveChanges")}
              </Button>
            </div>

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
          </form>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
