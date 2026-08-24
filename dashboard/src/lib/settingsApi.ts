import { apiClient } from "./apiClient";

// Mirrors local-be's settings/domain/setting.ts — a record-keeping surface,
// not a live config source (see local-be's AdminSettingsController).
export type SettingType = "number" | "string" | "boolean" | "json";
export type SettingCategory = "payment" | "shipping" | "commission" | "sms" | "auth" | "general";

export interface AdminSetting {
  id: string;
  key: string;
  value: string | number | boolean;
  type: SettingType;
  category: SettingCategory;
  descriptionEn: string;
  descriptionAr?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export async function listAdminSettings(): Promise<AdminSetting[]> {
  const { data } = await apiClient.get<{ success: true; data: AdminSetting[] }>("/admin/settings");

  return data.data;
}

export async function updateAdminSetting(
  key: string,
  value: string | number | boolean
): Promise<AdminSetting> {
  const { data } = await apiClient.patch<{ success: true; setting: AdminSetting }>(
    `/admin/settings/${key}`,
    { value }
  );

  return data.setting;
}
