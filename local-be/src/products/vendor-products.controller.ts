import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';
import { VendorsService } from '../vendors/vendors.service';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListVendorOwnProductsQueryDto } from './dto/list-vendor-own-products-query.dto';
import {
  ProductResponseDto,
  ProductsListResponseDto,
} from './dto/product-response.dto';

// Vendor self-service product CRUD, scoped to the authenticated vendor's own
// store. Deliberately a separate route/tag ("vendor/products") from
// VendorsController's "vendors/*" (account management) — mirrors the
// mobile-auth/dashboard-auth split precedent for a distinct concern.
@ApiTags('Vendor - Products')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('vendor')
@Controller('vendor/products')
export class VendorProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly vendorsService: VendorsService,
  ) {}

  @ApiCreatedResponse({ type: ProductResponseDto })
  @Post()
  async create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const vendor = await this.getOwnVendor(currentUser.userId);
    const product = await this.productsService.createByVendor(vendor.id, dto);
    return { success: true, product };
  }

  @ApiOkResponse({ type: ProductsListResponseDto })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: ListVendorOwnProductsQueryDto,
  ): Promise<ProductsListResponseDto> {
    const vendor = await this.getOwnVendor(currentUser.userId);
    const { data, total } = await this.productsService.listByVendor(vendor.id, {
      page: query.page,
      limit: query.limit,
      status: query.status,
      categoryId: query.categoryId,
      search: query.search,
    });
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: ProductResponseDto })
  @Patch(':id')
  async update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const vendor = await this.getOwnVendor(currentUser.userId);
    const product = await this.productsService.updateByVendor(
      vendor.id,
      id,
      dto,
    );
    return { success: true, product };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<MessageResponseDto> {
    const vendor = await this.getOwnVendor(currentUser.userId);
    await this.productsService.removeByVendor(vendor.id, id);
    return {
      success: true,
      message: MESSAGES.PRODUCT.DELETED.en,
      messageAr: MESSAGES.PRODUCT.DELETED.ar,
    };
  }

  private async getOwnVendor(userId: string) {
    const vendor = await this.vendorsService.findByUserId(userId);
    if (!vendor) {
      throw new AppException(
        ERROR_CODES.VENDOR_NOT_FOUND,
        'Vendor not found',
        404,
      );
    }
    return vendor;
  }
}
