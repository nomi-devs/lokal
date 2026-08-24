import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { VendorsService } from '../vendors/vendors.service';
import { Review } from './domain/review';
import {
  AdminListReviewsFilters,
  ReviewRepository,
} from './infrastructure/persistence/review.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { RatingSummaryDto } from './dto/review-response.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly vendorsService: VendorsService,
  ) {}

  // Only a delivered order's own items are reviewable — proves the review
  // is a real, verified purchase (isVerifiedPurchase is always true as a
  // result, see Review domain) and gives us the vendorId/customerId/orderId
  // triple the unique index dedupes on.
  async submit(customerId: string, dto: CreateReviewDto): Promise<Review> {
    const order = await this.ordersService.getForCustomerOrThrow(
      customerId,
      dto.orderId,
    );
    if (order.status !== 'delivered') {
      throw new AppException(
        ERROR_CODES.ORDER_NOT_DELIVERED,
        'Only delivered orders can be reviewed',
        422,
      );
    }
    const purchasedItem = order.items.find(
      (item) => item.productId === dto.productId,
    );
    if (!purchasedItem) {
      throw new AppException(
        ERROR_CODES.PRODUCT_NOT_IN_ORDER,
        'This product was not part of the given order',
        422,
      );
    }

    const existing = await this.reviewRepository.findOneByCustomerOrderProduct(
      customerId,
      dto.orderId,
      dto.productId,
    );
    if (existing) {
      throw new AppException(
        ERROR_CODES.REVIEW_ALREADY_EXISTS,
        'You already reviewed this product for this order',
        409,
      );
    }

    return this.reviewRepository.create({
      productId: dto.productId,
      vendorId: order.storeId,
      orderId: dto.orderId,
      customerId,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      images: dto.images ?? [],
      isVerifiedPurchase: true,
      status: 'pending',
    });
  }

  listMine(
    customerId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Review[]; total: number }> {
    return this.reviewRepository.findManyByCustomerId(customerId, page, limit);
  }

  // Customer fully owns their own review, moderated or not — same
  // unconditional-remove precedent as WishlistsService. If it was already
  // counted in the public aggregate (status: 'approved'), the product/vendor
  // rating is recomputed after removal.
  async removeOwn(customerId: string, id: string): Promise<void> {
    const review = await this.getOwnedByCustomerOrThrow(customerId, id);
    await this.reviewRepository.remove(id);
    if (review.status === 'approved') {
      await this.recomputeAggregates(review.productId, review.vendorId);
    }
  }

  // Public, unauthenticated: product detail screen. Only ever surfaces
  // approved reviews — pending/rejected ones stay invisible to everyone but
  // their author (see listMine) and admins (see listForAdmin).
  async listForProduct(
    productId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Review[]; total: number; summary: RatingSummaryDto }> {
    const product = await this.productsService.findById(productId);
    if (!product || product.status !== 'active') {
      throw new AppException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        'Product not found',
        404,
      );
    }

    const [{ data, total }, summary] = await Promise.all([
      this.reviewRepository.findManyByProductId(
        productId,
        'approved',
        page,
        limit,
      ),
      this.reviewRepository.aggregateByProductId(productId, 'approved'),
    ]);
    return { data, total, summary };
  }

  // Public, unauthenticated: Store Details screen — same approved-only rule
  // as listForProduct, aggregated across every product the vendor sells.
  async listForVendor(
    vendorId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Review[]; total: number; summary: RatingSummaryDto }> {
    const vendor = await this.vendorsService.findById(vendorId);
    if (!vendor || vendor.status !== 'active') {
      throw new AppException(
        ERROR_CODES.VENDOR_NOT_FOUND,
        'Vendor not found',
        404,
      );
    }

    const [{ data, total }, summary] = await Promise.all([
      this.reviewRepository.findManyByVendorId(
        vendorId,
        'approved',
        page,
        limit,
      ),
      this.reviewRepository.aggregateByVendorId(vendorId, 'approved'),
    ]);
    return { data, total, summary };
  }

  listForAdmin(
    filters: AdminListReviewsFilters,
  ): Promise<{ data: Review[]; total: number }> {
    return this.reviewRepository.findManyForAdmin(filters);
  }

  // Approve/reject a pending (or re-moderate an already-decided) review.
  // Either transition recomputes the product's and vendor's rating
  // aggregate, since both only count 'approved' reviews.
  async moderate(id: string, dto: ModerateReviewDto): Promise<Review> {
    const review = await this.getOrThrow(id);

    const updated = await this.reviewRepository.update(id, {
      status: dto.status,
      ...(dto.status === 'approved'
        ? { approvedAt: new Date() }
        : { rejectionReason: dto.rejectionReason }),
    });
    await this.recomputeAggregates(review.productId, review.vendorId);
    return updated as Review;
  }

  private async recomputeAggregates(
    productId: string,
    vendorId: string,
  ): Promise<void> {
    const [productSummary, vendorSummary] = await Promise.all([
      this.reviewRepository.aggregateByProductId(productId, 'approved'),
      this.reviewRepository.aggregateByVendorId(vendorId, 'approved'),
    ]);
    await Promise.all([
      this.productsService.updateRatingAggregate(
        productId,
        productSummary.average,
        productSummary.count,
      ),
      this.vendorsService.updateRatingAggregate(
        vendorId,
        vendorSummary.average,
        vendorSummary.count,
      ),
    ]);
  }

  private async getOwnedByCustomerOrThrow(
    customerId: string,
    id: string,
  ): Promise<Review> {
    const review = await this.reviewRepository.findById(id);
    // 404 (not 403) for cross-customer access — same precedent as
    // AddressesService/ProductsService.
    if (!review || review.customerId !== customerId) {
      throw new AppException(
        ERROR_CODES.REVIEW_NOT_FOUND,
        'Review not found',
        404,
      );
    }
    return review;
  }

  private async getOrThrow(id: string): Promise<Review> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new AppException(
        ERROR_CODES.REVIEW_NOT_FOUND,
        'Review not found',
        404,
      );
    }
    return review;
  }
}
