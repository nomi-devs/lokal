import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';

// Customer self-service cart. Scoped to the authenticated user's own cart
// only — one cart per user, created lazily on first read/write (see
// CartService.getOrCreate). Same ownership-in-service pattern as
// AddressesController/WishlistsController.
@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('me/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOkResponse({ type: CartResponseDto })
  @Get()
  async get(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.getForUser(currentUser.userId);
    return { success: true, cart };
  }

  @ApiOkResponse({ type: CartResponseDto })
  @Post('items')
  async addItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.addItem(currentUser.userId, dto);
    return { success: true, cart };
  }

  @ApiOkResponse({ type: CartResponseDto })
  @Patch('items/:itemId')
  async updateItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.updateItemQty(
      currentUser.userId,
      itemId,
      dto.qty,
    );
    return { success: true, cart };
  }

  @ApiOkResponse({ type: CartResponseDto })
  @Delete('items/:itemId')
  async removeItem(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('itemId') itemId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.removeItem(currentUser.userId, itemId);
    return { success: true, cart };
  }

  @ApiOkResponse({ type: CartResponseDto })
  @Delete()
  async clear(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CartResponseDto> {
    const cart = await this.cartService.clear(currentUser.userId);
    return { success: true, cart };
  }
}
