import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ReviewsService } from './reviews.service';
import { ProductReviewsResponseDto } from './dto/review-response.dto';

// Public, unauthenticated: the product detail screen's rating/reviews
// section. Only ever surfaces approved reviews — see
// ReviewsService.listForProduct.
@ApiTags('Reviews')
@Controller('products/:productId/reviews')
export class ProductReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOkResponse({ type: ProductReviewsResponseDto })
  @Get()
  async list(
    @Param('productId') productId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<ProductReviewsResponseDto> {
    const { data, total, summary } = await this.reviewsService.listForProduct(
      productId,
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
