import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReviewsService } from './reviews.service';
import { AdminListReviewsQueryDto } from './dto/admin-list-reviews-query.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import {
  ReviewResponseDto,
  ReviewsListResponseDto,
} from './dto/review-response.dto';

// Moderation queue — a review only counts toward its product's/vendor's
// public rating once approved here (see ReviewsService.moderate).
@ApiTags('Admin - Reviews')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOkResponse({ type: ReviewsListResponseDto })
  @Get()
  async list(
    @Query() query: AdminListReviewsQueryDto,
  ): Promise<ReviewsListResponseDto> {
    const { data, total } = await this.reviewsService.listForAdmin({
      page: query.page,
      limit: query.limit,
      status: query.status,
      productId: query.productId,
      vendorId: query.vendorId,
    });
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: ReviewResponseDto })
  @Patch(':id/status')
  async moderate(
    @Param('id') id: string,
    @Body() dto: ModerateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsService.moderate(id, dto);
    return { success: true, review };
  }
}
