import { apiClient } from "./apiClient";
import type { AuthUser } from "./authApi";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface AdminUserRow extends AuthUser {
  status: "active" | "inactive" | "suspended" | "deleted";
  language: "en" | "ar";
  createdAt: string;
  lastLogin?: string;
  isPhoneVerified: boolean;
  rating: number;
  reviewCount: number;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export async function listUsers(params: ListUsersParams = {}) {
  const { data } = await apiClient.get<{ success: true; data: AdminUserRow[]; pagination: Pagination }>(
    "/admin/users",
    { params: { page: 1, limit: 100, ...params } }
  );

  return data;
}

export async function getUser(id: string) {
  const { data } = await apiClient.get<{ success: true; user: AdminUserRow }>(`/admin/users/${id}`);

  return data.user;
}

export async function updateUserStatus(id: string, status: "active" | "inactive" | "suspended", reason?: string) {
  const { data } = await apiClient.put<{ success: true; message: string; user: { status: string } }>(
    `/admin/users/${id}/status`,
    { status, reason }
  );

  return data;
}

export async function deleteUser(id: string, reason?: string) {
  const { data } = await apiClient.delete<{ success: true; message: string }>(`/admin/users/${id}`, {
    data: { reason },
  });

  return data;
}

export interface AdminVendorRow {
  id: string;
  storeName: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  city?: string;
  status: "pending_approval" | "active" | "suspended" | "inactive";
  createdAt: string;
  message?: string;
  kycDocumentUrl?: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export interface ListVendorsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export async function listVendors(params: ListVendorsParams = {}) {
  const { data } = await apiClient.get<{ success: true; data: AdminVendorRow[]; pagination: Pagination }>(
    "/admin/vendors",
    { params: { page: 1, limit: 100, ...params } }
  );

  return data;
}

export async function approveVendor(id: string, approvalNotes?: string) {
  const { data } = await apiClient.put<{
    success: true;
    message: string;
    vendor: { status: string; approvedAt: string };
  }>(`/admin/vendors/${id}/approve`, { approvalNotes });

  return data;
}

export async function rejectVendor(id: string, rejectionReason: string, rejectionCategory: string) {
  const { data } = await apiClient.put<{
    success: true;
    message: string;
    vendor: { status: string; rejectionReason: string };
  }>(`/admin/vendors/${id}/reject`, { rejectionReason, rejectionCategory });

  return data;
}

export async function suspendVendor(id: string, reason: string, duration?: number) {
  const { data } = await apiClient.put<{ success: true; message: string }>(`/admin/vendors/${id}/suspend`, {
    reason,
    duration,
  });

  return data;
}

// Mirrors local-be's products/domain/product.ts.
export interface AdminProduct {
  id: string;
  vendorId: string;
  categoryId?: string;
  department: "men" | "women" | "kids" | "unisex";
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  images: string[];
  price: { base: number; currency: string; compareAt?: number };
  sizes: string[];
  colors: string[];
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  ratings: { average: number; count: number };
  createdAt: string;
  updatedAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export async function getVendorProducts(vendorId: string, page = 1, limit = 10) {
  const { data } = await apiClient.get<{ success: true; data: AdminProduct[]; pagination: Pagination }>(
    `/admin/vendors/${vendorId}/products`,
    { params: { page, limit } }
  );

  return data;
}

export interface AdminWishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  product: AdminProduct | null;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export async function getUserWishlist(userId: string, page = 1, limit = 10) {
  const { data } = await apiClient.get<{ success: true; data: AdminWishlistItem[]; pagination: Pagination }>(
    `/admin/users/${userId}/wishlist`,
    { params: { page, limit } }
  );

  return data;
}

// Mirrors local-be's addresses/domain/address.ts.
export interface AdminAddress {
  id: string;
  userId: string;
  type: "home" | "office" | "other";
  recipientName: string;
  country: string;
  city: string;
  phone: string;
  address: string;
  isPrimary: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export async function getUserAddresses(userId: string, page = 1, limit = 10) {
  const { data } = await apiClient.get<{ success: true; data: AdminAddress[]; pagination: Pagination }>(
    `/admin/users/${userId}/addresses`,
    { params: { page, limit } }
  );

  return data;
}
