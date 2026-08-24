import { ApiProperty } from '@nestjs/swagger';
import { REVIEW_STATUSES } from '../reviews.constants';
import type { ReviewStatus } from '../reviews.constants';

class LocalizedText {
  @ApiProperty() en: string;
  @ApiProperty({ required: false }) ar?: string;
}

export class Review {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  productId: string;

  // Denormalized from the order at submission time so store-level
  // aggregation (GET /vendors/:id/reviews) doesn't need a per-review
  // product lookup — same precedent as Order.storeId.
  @ApiProperty({ type: String })
  vendorId: string;

  @ApiProperty({ type: String })
  orderId: string;

  @ApiProperty({ type: String })
  customerId: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ type: LocalizedText })
  title: LocalizedText;

  @ApiProperty({ type: LocalizedText })
  comment: LocalizedText;

  @ApiProperty({ type: [String] })
  images: string[];

  // Always true in practice — a review can only ever be created from a
  // delivered order/product pair (see ReviewsService.submit) — kept as an
  // explicit field to match the ERD rather than something the client infers.
  @ApiProperty()
  isVerifiedPurchase: boolean;

  @ApiProperty({ enum: REVIEW_STATUSES })
  status: ReviewStatus;

  @ApiProperty({ type: String, nullable: true })
  rejectionReason?: string;

  @ApiProperty({ type: Date, nullable: true })
  approvedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
