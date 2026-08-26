import axios from "axios";

import { apiClient } from "./apiClient";
import type { Pagination } from "./adminApi";

// Mirrors local-be's products/domain/product.ts. No separate approval
// workflow — products are live by default (status: "active"); admin can flag
// one "rejected" after the fact (with rejectionReason) or delete it outright.
export interface Product {
  id: string;
  vendorId: string;
  categoryId: string;
  gender: "male" | "female" | "kids" | "unisex";
  name: { en: string; ar?: string };
  description: { en: string; ar?: string };
  images: string[];
  price: number;
  compareAtPrice?: number;
  sizes: string[];
  colors: string[];
  stock: number;
  inStock: boolean;
  status: "active" | "inactive" | "rejected";
  rejectionReason?: string;
  rating: number;
  ratingCount: number;
  salesCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export interface ProductPayload {
  categoryId: string;
  gender: "male" | "female" | "kids" | "unisex";
  name: { en: string; ar?: string };
  description: { en: string; ar?: string };
  images: string[];
  price: number;
  compareAtPrice?: number;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  inStock?: boolean;
  // Vendor-settable subset — only admin can set "rejected" (see updateAdminProduct).
  status?: "active" | "inactive";
}

// Authenticated — used by both the admin and vendor product-image galleries.
// See local-be's POST /files/upload-url (purpose: "product-image").
export async function uploadProductImage(file: File): Promise<string> {
  const { data } = await apiClient.post<{ success: true; uploadUrl: string; fileUrl: string }>(
    "/files/upload-url",
    { fileName: file.name, contentType: file.type, purpose: "product-image" }
  );

  await axios.put(data.uploadUrl, file, { headers: { "Content-Type": file.type } });

  return data.fileUrl;
}

// Public — GET /categories only returns active categories. Just enough for
// the category picker in the product dialogs; not a full categories CRUD wire-up.
export interface CategoryOption {
  id: string;
  nameEn: string;
  nameAr: string;
}

export async function listCategories(): Promise<CategoryOption[]> {
  const { data } = await apiClient.get<{
    success: true;
    data: CategoryOption[];
    pagination: Pagination;
  }>("/categories", { params: { page: 1, limit: 200 } });

  return data.data;
}

// ── Vendor self-service (GET/POST/PATCH/DELETE /vendor/products) ──────────

export interface ListVendorProductsParams {
  page?: number;
  limit?: number;
  status?: "active" | "inactive" | "rejected";
  categoryId?: string;
  search?: string;
}

export async function listMyProducts(params: ListVendorProductsParams = {}) {
  const { data } = await apiClient.get<{ success: true; data: Product[]; pagination: Pagination }>(
    "/vendor/products",
    { params: { page: 1, limit: 100, ...params } }
  );

  return data;
}

export async function createMyProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.post<{ success: true; product: Product }>(
    "/vendor/products",
    payload
  );

  return data.product;
}

export async function updateMyProduct(
  id: string,
  payload: Partial<ProductPayload>
): Promise<Product> {
  const { data } = await apiClient.patch<{ success: true; product: Product }>(
    `/vendor/products/${id}`,
    payload
  );

  return data.product;
}

export async function deleteMyProduct(id: string) {
  const { data } = await apiClient.delete<{ success: true; message: string }>(
    `/vendor/products/${id}`
  );

  return data;
}

// ── Admin (GET/PATCH/DELETE /admin/products) ───────────────────────────────

export interface ListAdminProductsParams {
  page?: number;
  limit?: number;
  status?: "active" | "inactive" | "rejected";
  vendorId?: string;
  categoryId?: string;
  search?: string;
}

export async function listAdminProducts(params: ListAdminProductsParams = {}) {
  const { data } = await apiClient.get<{ success: true; data: Product[]; pagination: Pagination }>(
    "/admin/products",
    { params: { page: 1, limit: 100, ...params } }
  );

  return data;
}

export async function getAdminProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<{ success: true; product: Product }>(
    `/admin/products/${id}`
  );

  return data.product;
}

// General edit endpoint — also how admin rejects (status: "rejected" +
// rejectionReason) or reinstates (status: "active") a product; there's no
// separate approve/reject endpoint.
export async function updateAdminProduct(
  id: string,
  payload: Partial<Omit<ProductPayload, "status">> & {
    status?: "active" | "inactive" | "rejected";
    rejectionReason?: string;
  }
): Promise<Product> {
  const { data } = await apiClient.patch<{ success: true; product: Product }>(
    `/admin/products/${id}`,
    payload
  );

  return data.product;
}

export async function deleteAdminProduct(id: string) {
  const { data } = await apiClient.delete<{ success: true; message: string }>(
    `/admin/products/${id}`
  );

  return data;
}
