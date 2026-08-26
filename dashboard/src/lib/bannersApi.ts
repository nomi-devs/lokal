import axios from "axios";

import { apiClient } from "./apiClient";
import type { Pagination } from "./adminApi";

// Mirrors local-be's banners/domain/banner.ts.
export interface AdminBanner {
  id: string;
  imageUrl: string;
  titleEn?: string;
  titleAr?: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export interface BannerPayload {
  imageUrl: string;
  titleEn?: string;
  titleAr?: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export async function listAdminBanners(page = 1, limit = 100) {
  const { data } = await apiClient.get<{
    success: true;
    data: AdminBanner[];
    pagination: Pagination;
  }>("/admin/banners", { params: { page, limit } });

  return data;
}

export async function createAdminBanner(payload: BannerPayload) {
  const { data } = await apiClient.post<{ success: true; banner: AdminBanner }>(
    "/admin/banners",
    payload
  );

  return data.banner;
}

export async function updateAdminBanner(id: string, payload: Partial<BannerPayload>) {
  const { data } = await apiClient.put<{ success: true; banner: AdminBanner }>(
    `/admin/banners/${id}`,
    payload
  );

  return data.banner;
}

export async function deleteAdminBanner(id: string) {
  const { data } = await apiClient.delete<{ success: true; message: string }>(
    `/admin/banners/${id}`
  );

  return data;
}

export async function uploadBannerImage(file: File): Promise<string> {
  const { data } = await apiClient.post<{ success: true; uploadUrl: string; fileUrl: string }>(
    "/files/upload-url",
    { fileName: file.name, contentType: file.type, purpose: "banner" }
  );
  await axios.put(data.uploadUrl, file, { headers: { "Content-Type": file.type } });

  return data.fileUrl;
}
