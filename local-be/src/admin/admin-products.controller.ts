import {
  Body,
  Controller,
  Delete,
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
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { ProductsService } from '../products/products.service';
import { ListAdminProductsQueryDto } from '../products/dto/list-admin-products-query.dto';
import { AdminUpdateProductDto } from '../products/dto/admin-update-product.dto';
import {
  ProductResponseDto,
  ProductsListResponseDto,
} from '../products/dto/product-response.dto';

@ApiTags('Admin - Products')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOkResponse({ type: ProductsListResponseDto })
  @Get()
  async list(
    @Query() query: ListAdminProductsQueryDto,
  ): Promise<ProductsListResponseDto> {
    const { data, total } = await this.productsService.listForAdmin({
      page: query.page,
      limit: query.limit,
      vendorId: query.vendorId,
      categoryId: query.categoryId,
      status: query.status,
      search: query.search,
    });
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: ProductResponseDto })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new AppException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        'Product not found',
        404,
      );
    }
    return { success: true, product };
  }

  @ApiOkResponse({ type: ProductResponseDto })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.updateByAdmin(id, dto);
    return { success: true, product };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<MessageResponseDto> {
    await this.productsService.removeByAdmin(id);
    return {
      success: true,
      message: MESSAGES.PRODUCT.DELETED.en,
      messageAr: MESSAGES.PRODUCT.DELETED.ar,
    };
  }
}
