import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { MESSAGES } from '../common/constants/messages.constant';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  ReviewResponseDto,
  ReviewsListResponseDto,
} from './dto/review-response.dto';

// Customer self-service — submit a review for a delivered order/product and
// browse/retract your own submissions (any status, not just approved — see
// ProductReviewsController/VendorReviewsController for the public,
// approved-only view everyone else sees).
@ApiTags('Reviews')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('me/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOkResponse({ type: ReviewsListResponseDto })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<ReviewsListResponseDto> {
    const { data, total } = await this.reviewsService.listMine(
      currentUser.userId,
      query.page,
      query.limit,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiCreatedResponse({ type: ReviewResponseDto })
  @Post()
  async submit(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsService.submit(currentUser.userId, dto);
    return { success: true, review };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<MessageResponseDto> {
    await this.reviewsService.removeOwn(currentUser.userId, id);
    return {
      success: true,
      message: MESSAGES.REVIEW.DELETED.en,
      messageAr: MESSAGES.REVIEW.DELETED.ar,
    };
  }
}
