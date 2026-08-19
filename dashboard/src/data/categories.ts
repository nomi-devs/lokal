// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
// Shape mirrors the CATEGORIES collection in the ERD.
import type { Department } from "./products";

export type Category = {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  image?: string;
  parentId: number | null;
  /** Audience facet — see Department in products.ts (same Male/Female/Kids tabs as the mobile app). */
  department: Department;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  // Admin-list display extra (not part of the core ERD entity)
  itemsCount: number;
};

export const categories: Category[] = [
  {
    id: 1,
    nameEn: "Construction",
    nameAr: "البناء والمقاولات",
    parentId: null,
    department: "unisex",
    isActive: true,
    sortOrder: 1,
    itemsCount: 128,
    createdAt: "2025-01-01",
    updatedAt: "2026-06-01",
  },
  {
    id: 2,
    nameEn: "Design & Architecture",
    nameAr: "التصميم والعمارة",
    parentId: null,
    department: "unisex",
    isActive: true,
    sortOrder: 2,
    itemsCount: 74,
    createdAt: "2025-01-01",
    updatedAt: "2026-06-01",
  },
  {
    id: 3,
    nameEn: "Plumbing",
    nameAr: "السباكة",
    parentId: null,
    department: "unisex",
    isActive: true,
    sortOrder: 3,
    itemsCount: 96,
    createdAt: "2025-01-01",
    updatedAt: "2026-06-01",
  },
  {
    id: 4,
    nameEn: "Electricity",
    nameAr: "الكهرباء",
    parentId: null,
    department: "unisex",
    isActive: true,
    sortOrder: 4,
    itemsCount: 61,
    createdAt: "2025-01-01",
    updatedAt: "2026-06-01",
  },
  {
    id: 5,
    nameEn: "Landscaping",
    nameAr: "تنسيق الحدائق",
    parentId: null,
    department: "unisex",
    isActive: true,
    sortOrder: 5,
    itemsCount: 42,
    createdAt: "2025-01-01",
    updatedAt: "2026-06-01",
  },
  {
    id: 6,
    nameEn: "Interior Painting",
    nameAr: "الدهانات الداخلية",
    parentId: 2,
    department: "unisex",
    isActive: true,
    sortOrder: 6,
    itemsCount: 23,
    createdAt: "2025-02-01",
    updatedAt: "2026-06-01",
  },
  {
    id: 7,
    nameEn: "HVAC",
    nameAr: "التكييف والتهوية",
    parentId: null,
    department: "unisex",
    isActive: false,
    sortOrder: 7,
    itemsCount: 18,
    createdAt: "2025-02-15",
    updatedAt: "2026-05-01",
  },
  {
    id: 8,
    nameEn: "Residential Wiring",
    nameAr: "أسلاك المنازل",
    parentId: 4,
    department: "unisex",
    isActive: true,
    sortOrder: 8,
    itemsCount: 29,
    createdAt: "2025-03-01",
    updatedAt: "2026-05-01",
  },
  {
    id: 9,
    nameEn: "Seasonal Decor",
    nameAr: "الديكور الموسمي",
    parentId: 5,
    department: "unisex",
    isActive: false,
    sortOrder: 9,
    itemsCount: 7,
    createdAt: "2025-03-10",
    updatedAt: "2026-04-01",
  },
];
