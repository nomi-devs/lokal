import {
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
import { WishlistsService } from './wishlists.service';
import {
  WishlistItemResponseDto,
  WishlistListResponseDto,
} from './dto/wishlist-response.dto';

// Customer-only — see WishlistsService.findManyPublicByUserId for the
// "hide entries whose product is no longer public" rule.
@ApiTags('Wishlist')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('me/wishlist')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @ApiOkResponse({ type: WishlistListResponseDto })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<WishlistListResponseDto> {
    const { data, total } = await this.wishlistsService.findManyPublicByUserId(
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

  @ApiCreatedResponse({ type: WishlistItemResponseDto })
  @Post(':productId')
  async add(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('productId') productId: string,
  ): Promise<WishlistItemResponseDto> {
    const item = await this.wishlistsService.addToWishlist(
      currentUser.userId,
      productId,
    );
    return {
      success: true,
      message: MESSAGES.WISHLIST.ADDED.en,
      messageAr: MESSAGES.WISHLIST.ADDED.ar,
      item: { ...item, product: null },
    };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete(':productId')
  async remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('productId') productId: string,
  ): Promise<MessageResponseDto> {
    await this.wishlistsService.removeFromWishlist(
      currentUser.userId,
      productId,
    );
    return {
      success: true,
      message: MESSAGES.WISHLIST.REMOVED.en,
      messageAr: MESSAGES.WISHLIST.REMOVED.ar,
    };
  }
}
