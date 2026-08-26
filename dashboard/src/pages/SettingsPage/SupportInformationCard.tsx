import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Headphones, Save, Mail, Phone, MessageCircle, Globe, MapPin, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { AdminSetting, SupportSettingKey } from "@/lib/settingsApi";

// The 5 keys settings-seed.service.ts (local-be) creates under category
// "support" — this card is a purpose-built form over those rows rather than
// the generic key/value grid the other categories render through.
const SUPPORT_FIELDS: Array<{
  key: SupportSettingKey;
  icon: LucideIcon;
  required?: boolean;
  full?: boolean;
}> = [
  { key: "supportEmail", icon: Mail, required: true },
  { key: "supportPhone", icon: Phone, required: true },
  { key: "whatsappNumber", icon: MessageCircle },
  { key: "websiteUrl", icon: Globe },
  { key: "officeAddress", icon: MapPin, full: true },
];

const inputCls =
  "h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

interface SupportInformationCardProps {
  settings: AdminSetting[];
  loading: boolean;
  onSave: (values: Partial<Record<SupportSettingKey, string>>) => Promise<void>;
}

export function SupportInformationCard({ settings, loading, onSave }: SupportInformationCardProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const field of SUPPORT_FIELDS) {
      const setting = settings.find((s) => s.key === field.key);
      next[field.key] = setting ? String(setting.value) : "";
    }
    setValues(next);
  }, [settings]);

  async function handleSave() {
    setSaving(true);
    try {
      const changed = SUPPORT_FIELDS.filter((field) => {
        const original = settings.find((s) => s.key === field.key);

        return original && String(original.value) !== values[field.key];
      });

      if (changed.length > 0) {
        const payload: Partial<Record<SupportSettingKey, string>> = {};
        for (const field of changed) {
          payload[field.key] = values[field.key] ?? "";
        }
        await onSave(payload);
      }

      toast.success(t("settings.support.savedToast.body"), {
        title: t("settings.support.savedToast.title"),
      });
    } catch {
      toast.error(t("settings.support.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Headphones className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{t("settings.support.title")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t("settings.support.description")}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading", "Loading…")}</p>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">{t("settings.support.contactDetails")}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SUPPORT_FIELDS.map((field) => {
              const Icon = field.icon;

              return (
                <div key={field.key} className={cn("flex flex-col gap-1.5", field.full && "sm:col-span-2")}>
                  <label className="text-sm font-medium">
                    {t(`settings.support.fields.${field.key}.label`)}
                    {field.required && <span className="text-destructive"> *</span>}
                  </label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      className={inputCls}
                      value={values[field.key] ?? ""}
                      placeholder={t(`settings.support.fields.${field.key}.placeholder`)}
                      onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(`settings.support.fields.${field.key}.caption`)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4" />
              {t("settings.saveChanges")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
