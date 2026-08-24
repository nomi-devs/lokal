import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OrdersService } from '../orders/orders.service';
import { ListAdminOrdersQueryDto } from '../orders/dto/list-admin-orders-query.dto';
import {
  OrderResponseDto,
  OrdersListResponseDto,
} from '../orders/dto/order-response.dto';

// Read-only — admin monitors/tracks orders but doesn't drive their status;
// that's the owning vendor's job via VendorOrdersController.
@ApiTags('Admin - Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOkResponse({ type: OrdersListResponseDto })
  @Get()
  async list(
    @Query() query: ListAdminOrdersQueryDto,
  ): Promise<OrdersListResponseDto> {
    const { data, total } = await this.ordersService.listForAdmin({
      page: query.page,
      limit: query.limit,
      status: query.status,
      vendorId: query.vendorId,
    });
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: OrderResponseDto })
  @Get(':id')
  async get(@Param('id') id: string): Promise<OrderResponseDto> {
    const order = await this.ordersService.getForAdminOrThrow(id);
    return { success: true, order };
  }
}
