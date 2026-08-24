import axios from "axios";

import { apiClient } from "./apiClient";
import type { AuthUser } from "./authApi";
import type { Product } from "./productsApi";

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

export interface CreateUserPayload {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  // Only meaningful for role "admin" — customer is the mobile-app, OTP-only
  // role with no password login anywhere.
  password?: string;
  role: "customer" | "admin";
  status?: "active" | "inactive";
}

export async function createUser(payload: CreateUserPayload) {
  const { data } = await apiClient.post<{ success: true; user: AdminUserRow }>("/admin/users", payload);

  return data.user;
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

// One endpoint for every status transition (previously three: approve/
// reject/suspend) — see local-be's UpdateVendorStatusDto. approveVendor/
// rejectVendor/suspendVendor below are thin, purpose-named wrappers around
// it so call sites (VendorsPage, KycVerificationPage) don't change.
interface UpdateVendorStatusResponse {
  success: true;
  message: string;
  vendor: { status: string; approvedAt?: string; rejectionReason?: string };
}

async function updateVendorStatus(
  id: string,
  payload: {
    status: "active" | "inactive" | "suspended";
    approvalNotes?: string;
    rejectionReason?: string;
    rejectionCategory?: string;
    suspendReason?: string;
    duration?: number;
  }
) {
  const { data } = await apiClient.put<UpdateVendorStatusResponse>(`/admin/vendors/${id}/status`, payload);

  return data;
}

export function approveVendor(id: string, approvalNotes?: string) {
  return updateVendorStatus(id, { status: "active", approvalNotes });
}

export function rejectVendor(id: string, rejectionReason: string, rejectionCategory: string) {
  return updateVendorStatus(id, { status: "inactive", rejectionReason, rejectionCategory });
}

export function suspendVendor(id: string, reason: string, duration?: number) {
  return updateVendorStatus(id, { status: "suspended", suspendReason: reason, duration });
}

export interface CreateVendorPayload {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  storeName: string;
  storeDescription?: string;
  city?: string;
  address?: string;
  kycDocumentUrl?: string;
  status?: "pending_approval" | "active";
}

export async function createVendor(payload: CreateVendorPayload) {
  const { data } = await apiClient.post<{ success: true; vendor: { id: string; storeName: string } }>(
    "/admin/vendors",
    payload
  );

  return data.vendor;
}

// See ./productsApi.ts for the full Product shape/type (mirrors local-be's
// products/domain/product.ts) and the dedicated vendor/admin product CRUD.
// This one stays here since it hangs off the vendor-detail view, not the
// Products pages themselves.
export async function getVendorProducts(vendorId: string, page = 1, limit = 10) {
  const { data } = await apiClient.get<{ success: true; data: Product[]; pagination: Pagination }>(
    `/admin/vendors/${vendorId}/products`,
    { params: { page, limit } }
  );

  return data;
}

export interface AdminWishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: Product | null;
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

// ── Categories ────────────────────────────────────────────────────────────────

export type CategoryDepartment = 'men' | 'women' | 'kids' | 'unisex';

export interface AdminCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  imageUrl?: string;
  parentId?: string | null;
  department: CategoryDepartment;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export async function listAdminCategories(page = 1, limit = 100) {
  const { data } = await apiClient.get<{ success: true; data: AdminCategory[]; pagination: Pagination }>(
    '/admin/categories',
    { params: { page, limit } }
  );

  return data;
}

export interface CategoryPayload {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  imageUrl?: string;
  parentId?: string | null;
  department?: CategoryDepartment;
  sortOrder?: number;
  isActive?: boolean;
}

export async function createAdminCategory(payload: CategoryPayload) {
  const { data } = await apiClient.post<{ success: true; category: AdminCategory }>(
    '/admin/categories',
    payload
  );

  return data.category;
}

export async function updateAdminCategory(id: string, payload: Partial<CategoryPayload>) {
  const { data } = await apiClient.put<{ success: true; category: AdminCategory }>(
    `/admin/categories/${id}`,
    payload
  );

  return data.category;
}

export async function deleteAdminCategory(id: string) {
  const { data } = await apiClient.delete<{ success: true; message: string }>(
    `/admin/categories/${id}`
  );

  return data;
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

export interface AdminFaq {
  id: string;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface FaqPayload {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  sortOrder?: number;
  isActive?: boolean;
}

export async function listAdminFaqs(page = 1, limit = 100) {
  const { data } = await apiClient.get<{ success: true; data: AdminFaq[]; pagination: Pagination }>(
    '/admin/faqs',
    { params: { page, limit } }
  );

  return data;
}

export async function createAdminFaq(payload: FaqPayload) {
  const { data } = await apiClient.post<{ success: true; faq: AdminFaq }>('/admin/faqs', payload);

  return data.faq;
}

export async function updateAdminFaq(id: string, payload: Partial<FaqPayload>) {
  const { data } = await apiClient.put<{ success: true; faq: AdminFaq }>(`/admin/faqs/${id}`, payload);

  return data.faq;
}

export async function deleteAdminFaq(id: string) {
  const { data } = await apiClient.delete<{ success: true; message: string }>(`/admin/faqs/${id}`);

  return data;
}

export async function uploadCategoryIcon(file: File): Promise<string> {
  const { data } = await apiClient.post<{ success: true; uploadUrl: string; fileUrl: string }>(
    "/files/upload-url",
    { fileName: file.name, contentType: file.type, purpose: "category-icon" }
  );
  await axios.put(data.uploadUrl, file, { headers: { "Content-Type": file.type } });

  return data.fileUrl;
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalVendors: number;
  pendingApprovals: number;
  activeVendors: number;
  suspendedVendors: number;
  registrations: { today: number; this_week: number; this_month: number };
  newVendorApplications: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const { data } = await apiClient.get<{ success: true; stats: AdminDashboardStats }>(
    "/admin/dashboard/stats"
  );

  return data.stats;
}
