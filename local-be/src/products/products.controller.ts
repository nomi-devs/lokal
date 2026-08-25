import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { OptionalCurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { ProductsService } from './products.service';
import { PublicListProductsQueryDto } from './dto/public-list-products-query.dto';
import {
  ProductResponseDto,
  ProductsListResponseDto,
} from './dto/product-response.dto';

// Public, unauthenticated: customer-app browse/search (see Module 5) and
// product-detail views. Only ever surfaces active + approved products
// belonging to an approved store (see ProductsService.findPublicOne/listPublic).
// OptionalJwtAuthGuard means a token is accepted but never required — when
// one is present, the response is personalized with isWishlisted (see
// Product.isWishlisted); an anonymous caller gets the exact same data minus
// that field.
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({ type: ProductsListResponseDto })
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async list(
    @Query() query: PublicListProductsQueryDto,
    @OptionalCurrentUser() currentUser?: AuthenticatedUser,
  ): Promise<ProductsListResponseDto> {
    const { data, total } = await this.productsService.listPublic(
      query,
      currentUser?.userId,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({ type: ProductResponseDto })
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @OptionalCurrentUser() currentUser?: AuthenticatedUser,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.findPublicOne(
      id,
      currentUser?.userId,
    );
    return { success: true, product };
  }
}
