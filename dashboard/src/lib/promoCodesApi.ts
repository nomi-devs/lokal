import { apiClient, listPaginated, del } from "./apiClient";

// Mirrors local-be's promo-codes/domain/promo-code.ts.
export type DiscountType = "percentage" | "fixed";

export interface AdminPromoCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUsageCount?: number;
  currentUsageCount: number;
  applicableVendorIds: string[];
  applicableCategoryIds: string[];
  minOrderValue?: number;
  maxDiscountCap?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export type PromoCodeStatus = "active" | "inactive" | "expired";

// Single source of truth for the computed status shown across the list and
// badges — mirrors the ERD-derived rule from the old mock (src/data/promoCodes.ts).
export function getPromoCodeStatus(
  promo: Pick<AdminPromoCode, "validUntil" | "isActive">,
  now = new Date()
): PromoCodeStatus {
  if (new Date(promo.validUntil) < now) {
    return "expired";
  }

  return promo.isActive ? "active" : "inactive";
}

export function estimatedDiscountPerUse(
  promo: Pick<AdminPromoCode, "discountType" | "discountValue" | "minOrderValue" | "maxDiscountCap">
): number {
  if (promo.discountType === "fixed") {
    return promo.discountValue;
  }

  const base = promo.minOrderValue ?? 100;
  const uncapped = (promo.discountValue / 100) * base;

  return promo.maxDiscountCap ? Math.min(uncapped, promo.maxDiscountCap) : uncapped;
}

export interface PromoCodePayload {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUsageCount?: number;
  applicableVendorIds?: string[];
  applicableCategoryIds?: string[];
  minOrderValue?: number;
  maxDiscountCap?: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
}

export interface ListAdminPromoCodesParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export async function listAdminPromoCodes(params: ListAdminPromoCodesParams = {}) {
  return listPaginated<AdminPromoCode>("/admin/promo-codes", params);
}

export async function createPromoCode(payload: PromoCodePayload): Promise<AdminPromoCode> {
  const { data } = await apiClient.post<{ success: true; promoCode: AdminPromoCode }>(
    "/admin/promo-codes",
    payload
  );

  return data.promoCode;
}

export async function updatePromoCode(
  id: string,
  payload: Partial<Omit<PromoCodePayload, "code">>
): Promise<AdminPromoCode> {
  const { data } = await apiClient.patch<{ success: true; promoCode: AdminPromoCode }>(
    `/admin/promo-codes/${id}`,
    payload
  );

  return data.promoCode;
}

export async function deletePromoCode(id: string) {
  return del(`/admin/promo-codes/${id}`);
}
