// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
// Not part of the original ERD — admin-only marketing tool, modeled the same way as the
// other admin collections (typed array + derived display state computed at read time).
export type DiscountType = "percentage" | "fixed";

export type PromoCode = {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number; // 20 (%) or 100 (KWD), depending on discountType
  maxUsageCount?: number; // undefined = unlimited
  currentUsageCount: number;
  applicableToVendors: number[]; // Vendor ids — empty = all vendors
  applicableToCategories: number[]; // Category ids — empty = all categories
  minOrderValue?: number;
  maxDiscountCap?: number; // percentage codes only
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;
};

export type PromoCodeStatus = "active" | "inactive" | "expired";

/** Single source of truth for the computed status shown across the list, badges, and details modal. */
export function getPromoCodeStatus(promo: PromoCode, now = new Date()): PromoCodeStatus {
  if (new Date(promo.validUntil) < now) {
    return "expired";
  }

  return promo.isActive ? "active" : "inactive";
}

export function getUsagePercent(promo: PromoCode): number | null {
  if (!promo.maxUsageCount) {
    return null;
  }

  return Math.round((promo.currentUsageCount / promo.maxUsageCount) * 1000) / 10;
}

/** Discount granted for a single redemption, used for the "Revenue Impact" stat and details modal. */
export function estimatedDiscountPerUse(promo: PromoCode): number {
  if (promo.discountType === "fixed") {
    return promo.discountValue;
  }

  const base = promo.minOrderValue ?? 100;
  const uncapped = (promo.discountValue / 100) * base;

  return promo.maxDiscountCap ? Math.min(uncapped, promo.maxDiscountCap) : uncapped;
}

export function calculateDiscount(promo: PromoCode, orderValue: number): number {
  if (promo.discountType === "fixed") {
    return Math.min(promo.discountValue, orderValue);
  }

  const uncapped = (promo.discountValue / 100) * orderValue;

  return promo.maxDiscountCap ? Math.min(uncapped, promo.maxDiscountCap) : uncapped;
}

export const promoCodes: PromoCode[] = [
  {
    id: 1,
    code: "SUMMER20",
    discountType: "percentage",
    discountValue: 20,
    maxUsageCount: 1000,
    currentUsageCount: 145,
    applicableToVendors: [],
    applicableToCategories: [1, 3],
    minOrderValue: 100,
    maxDiscountCap: 500,
    validFrom: "2026-05-01",
    validUntil: "2026-09-30",
    isActive: true,
    lastUsedAt: "2026-08-18T09:12:00Z",
    createdAt: "2026-04-20T10:00:00Z",
    createdBy: "admin@gmail.com",
    updatedAt: "2026-06-01T08:30:00Z",
  },
  {
    id: 2,
    code: "WEEKEND50",
    discountType: "fixed",
    discountValue: 50,
    maxUsageCount: 200,
    currentUsageCount: 187,
    applicableToVendors: [1, 5],
    applicableToCategories: [],
    minOrderValue: 150,
    validFrom: "2026-07-01",
    validUntil: "2026-12-31",
    isActive: true,
    lastUsedAt: "2026-08-19T07:40:00Z",
    createdAt: "2026-06-15T11:00:00Z",
    createdBy: "admin@gmail.com",
    updatedAt: "2026-08-01T09:00:00Z",
  },
  {
    id: 3,
    code: "SAVE10",
    discountType: "percentage",
    discountValue: 10,
    currentUsageCount: 812,
    applicableToVendors: [],
    applicableToCategories: [],
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    isActive: true,
    lastUsedAt: "2026-08-19T06:05:00Z",
    createdAt: "2026-01-01T09:00:00Z",
    createdBy: "admin@gmail.com",
    updatedAt: "2026-01-01T09:00:00Z",
  },
  {
    id: 4,
    code: "NEWUSER100",
    discountType: "fixed",
    discountValue: 100,
    maxUsageCount: 500,
    currentUsageCount: 63,
    applicableToVendors: [],
    applicableToCategories: [1, 2, 4],
    minOrderValue: 200,
    validFrom: "2026-03-01",
    validUntil: "2026-10-31",
    isActive: false,
    lastUsedAt: "2026-07-22T14:20:00Z",
    createdAt: "2026-02-20T10:00:00Z",
    createdBy: "admin@gmail.com",
    updatedAt: "2026-07-25T12:00:00Z",
    updatedBy: "admin@gmail.com",
  },
  {
    id: 5,
    code: "SPRINGDEAL",
    discountType: "percentage",
    discountValue: 15,
    maxUsageCount: 300,
    currentUsageCount: 300,
    applicableToVendors: [],
    applicableToCategories: [5],
    minOrderValue: 50,
    maxDiscountCap: 150,
    validFrom: "2026-02-01",
    validUntil: "2026-04-30",
    isActive: true,
    lastUsedAt: "2026-04-30T18:00:00Z",
    createdAt: "2026-01-15T09:00:00Z",
    createdBy: "admin@gmail.com",
    updatedAt: "2026-04-30T18:00:00Z",
  },
  {
    id: 6,
    code: "VENDOR25",
    discountType: "percentage",
    discountValue: 25,
    maxUsageCount: 150,
    currentUsageCount: 12,
    applicableToVendors: [3],
    applicableToCategories: [],
    minOrderValue: 80,
    maxDiscountCap: 200,
    validFrom: "2026-08-01",
    validUntil: "2027-01-31",
    isActive: true,
    lastUsedAt: "2026-08-15T10:30:00Z",
    createdAt: "2026-07-28T13:00:00Z",
    createdBy: "admin@gmail.com",
    updatedAt: "2026-07-28T13:00:00Z",
  },
  {
    id: 7,
    code: "FLASH5",
    discountType: "fixed",
    discountValue: 5,
    maxUsageCount: 2000,
    currentUsageCount: 1998,
    applicableToVendors: [],
    applicableToCategories: [],
    validFrom: "2026-01-01",
    validUntil: "2026-01-15",
    isActive: true,
    lastUsedAt: "2026-01-15T23:55:00Z",
    createdAt: "2025-12-20T09:00:00Z",
    createdBy: "admin@gmail.com",
    updatedAt: "2025-12-20T09:00:00Z",
  },
  {
    id: 8,
    code: "LOYALTY30",
    discountType: "percentage",
    discountValue: 30,
    currentUsageCount: 0,
    applicableToVendors: [],
    applicableToCategories: [3, 4],
    minOrderValue: 120,
    maxDiscountCap: 300,
    validFrom: "2026-09-01",
    validUntil: "2026-11-30",
    isActive: true,
    createdAt: "2026-08-10T10:00:00Z",
    createdBy: "admin@gmail.com",
    updatedAt: "2026-08-10T10:00:00Z",
  },
];
