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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { VendorsService } from '../vendors/vendors.service';
import { Vendor } from '../vendors/domain/vendor';
import { OrdersService } from './orders.service';
import { ListVendorOrdersQueryDto } from './dto/list-vendor-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  OrderResponseDto,
  OrdersListResponseDto,
} from './dto/order-response.dto';

// Vendor's own incoming orders — scoped by re-resolving the vendor from the
// authenticated user on every request (same precedent as
// VendorProductsController.getOwnVendor), not from a JWT-cached vendorId.
@ApiTags('Vendor - Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('vendor')
@Controller('vendor/orders')
export class VendorOrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly vendorsService: VendorsService,
  ) {}

  @ApiOkResponse({ type: OrdersListResponseDto })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: ListVendorOrdersQueryDto,
  ): Promise<OrdersListResponseDto> {
    const vendor = await this.getOwnVendor(currentUser.userId);
    const { data, total } = await this.ordersService.listForVendor(
      vendor.id,
      query.status,
      query.page,
      query.limit,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: OrderResponseDto })
  @Get(':id')
  async get(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<OrderResponseDto> {
    const vendor = await this.getOwnVendor(currentUser.userId);
    const order = await this.ordersService.getForVendorOrThrow(vendor.id, id);
    return { success: true, order };
  }

  @ApiOkResponse({ type: OrderResponseDto })
  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const vendor = await this.getOwnVendor(currentUser.userId);
    const order = await this.ordersService.updateStatusByVendor(
      vendor.id,
      id,
      dto,
    );
    return { success: true, order };
  }

  private async getOwnVendor(userId: string): Promise<Vendor> {
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
