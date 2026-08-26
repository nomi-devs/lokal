import { apiClient } from "./apiClient";
import type { Pagination } from "./adminApi";

// Mirrors local-be's reviews/domain/review.ts. A review only counts toward
// its product's/vendor's public rating once approved — see
// local-be's ReviewsService.moderate.
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface AdminReview {
  id: string;
  productId: string;
  vendorId: string;
  orderId: string;
  customerId: string;
  rating: number;
  title: { en: string; ar?: string };
  comment: { en: string; ar?: string };
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export interface ListAdminReviewsParams {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
  productId?: string;
  vendorId?: string;
}

export async function listAdminReviews(params: ListAdminReviewsParams = {}) {
  const { data } = await apiClient.get<{
    success: true;
    data: AdminReview[];
    pagination: Pagination;
  }>("/admin/reviews", { params: { page: 1, limit: 100, ...params } });

  return data;
}

export async function approveReview(id: string): Promise<AdminReview> {
  const { data } = await apiClient.patch<{ success: true; review: AdminReview }>(
    `/admin/reviews/${id}/status`,
    { status: "approved" }
  );

  return data.review;
}

export async function rejectReview(id: string, rejectionReason: string): Promise<AdminReview> {
  const { data } = await apiClient.patch<{ success: true; review: AdminReview }>(
    `/admin/reviews/${id}/status`,
    { status: "rejected", rejectionReason }
  );

  return data.review;
}
