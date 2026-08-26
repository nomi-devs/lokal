import { ApiProperty } from '@nestjs/swagger';
import { Review } from '../domain/review';
import { PaginationDto } from '../../common/dto/pagination-response.dto';

export class RatingSummaryDto {
  @ApiProperty({ description: 'Average of approved ratings, rounded to 1dp' })
  average: number;

  @ApiProperty({ description: 'Total approved reviews' })
  count: number;

  @ApiProperty({
    description: 'Approved review count per star, keyed "1".."5"',
    example: { '1': 0, '2': 1, '3': 2, '4': 5, '5': 12 },
  })
  breakdown: Record<string, number>;
}

export class ReviewResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Review })
  review: Review;
}

export class ReviewsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Review] })
  data: Review[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

// Response for the public product/store review endpoints — the list plus
// the aggregate the screen renders as a rating summary/star breakdown.
export class ProductReviewsResponseDto extends ReviewsListResponseDto {
  @ApiProperty({ type: RatingSummaryDto })
  summary: RatingSummaryDto;
}
