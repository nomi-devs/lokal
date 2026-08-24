import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ReviewsService } from './reviews.service';
import { ProductReviewsResponseDto } from './dto/review-response.dto';

// Public, unauthenticated: the Store Details screen's rating/reviews
// section, aggregated across every product the vendor sells — see
// ReviewsService.listForVendor. Route lives alongside VendorsController's
// and StoresController's own 'vendors' routes (all three share the prefix,
// none of their paths collide).
@ApiTags('Reviews')
@Controller('vendors/:vendorId/reviews')
export class VendorReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOkResponse({ type: ProductReviewsResponseDto })
  @Get()
  async list(
    @Param('vendorId') vendorId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<ProductReviewsResponseDto> {
    const { data, total, summary } = await this.reviewsService.listForVendor(
      vendorId,
      query.page,
      query.limit,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
      summary,
    };
  }
}
