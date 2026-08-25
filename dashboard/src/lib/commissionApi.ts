import { apiClient } from "./apiClient";

// Mirrors local-be's commission/domain/platform-commission.ts — the one
// platform-wide commission rate applied to every vendor's order at
// checkout. Unlike settingsApi's AdminSetting, this is live config: PATCH
// here changes real checkout math immediately.
export interface PlatformCommission {
  percentage: number;
  updatedBy?: string;
  updatedAt?: string;
}

// Readable by both dashboards (admin manages the rate, a vendor just
// checks their own cut on Store Profile) — see local-be's CommissionController.
export async function getCommission(): Promise<PlatformCommission> {
  const { data } = await apiClient.get<{ success: true; commission: PlatformCommission }>(
    "/commission"
  );

  return data.commission;
}

// Admin-only — local-be's RolesGuard rejects this for a vendor caller.
export async function updateCommission(percentage: number): Promise<PlatformCommission> {
  const { data } = await apiClient.patch<{ success: true; commission: PlatformCommission }>(
    "/commission",
    { percentage }
  );

  return data.commission;
}
