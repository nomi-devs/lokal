import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { Review } from '../../domain/review';

export interface RatingSummary {
  average: number;
  count: number;
  // Keyed '1'..'5' (star value) -> approved review count at that star.
  breakdown: Record<string, number>;
}

export interface AdminListReviewsFilters {
  page: number;
  limit: number;
  status?: string;
  productId?: string;
  vendorId?: string;
}

export abstract class ReviewRepository {
  abstract create(
    data: Omit<
      Review,
      'id' | 'createdAt' | 'updatedAt' | 'approvedAt' | 'rejectionReason'
    >,
  ): Promise<Review>;

  abstract findById(id: string): Promise<NullableType<Review>>;

  // Enforces "one review per customer per order per product" — see
  // ReviewsService.submit.
  abstract findOneByCustomerOrderProduct(
    customerId: string,
    orderId: string,
    productId: string,
  ): Promise<NullableType<Review>>;

  abstract findManyByCustomerId(
    customerId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Review[]; total: number }>;

  abstract findManyByProductId(
    productId: string,
    status: string,
    page: number,
    limit: number,
  ): Promise<{ data: Review[]; total: number }>;

  abstract findManyByVendorId(
    vendorId: string,
    status: string,
    page: number,
    limit: number,
  ): Promise<{ data: Review[]; total: number }>;

  abstract findManyForAdmin(
    filters: AdminListReviewsFilters,
  ): Promise<{ data: Review[]; total: number }>;

  abstract update(
    id: string,
    payload: DeepPartial<Review>,
  ): Promise<NullableType<Review>>;

  abstract remove(id: string): Promise<void>;

  abstract aggregateByProductId(
    productId: string,
    status: string,
  ): Promise<RatingSummary>;

  abstract aggregateByVendorId(
    vendorId: string,
    status: string,
  ): Promise<RatingSummary>;
}
