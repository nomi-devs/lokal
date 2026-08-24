import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { PublicListProductsQueryDto } from './dto/public-list-products-query.dto';
import {
  ProductResponseDto,
  ProductsListResponseDto,
} from './dto/product-response.dto';

// Public, unauthenticated: customer-app browse/search (see Module 5) and
// product-detail views. Only ever surfaces active + approved products
// belonging to an approved store (see ProductsService.findPublicOne/listPublic).
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOkResponse({ type: ProductsListResponseDto })
  @Get()
  async list(
    @Query() query: PublicListProductsQueryDto,
  ): Promise<ProductsListResponseDto> {
    const { data, total } = await this.productsService.listPublic(query);
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: ProductResponseDto })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.productsService.findPublicOne(id);
    return { success: true, product };
  }
}
