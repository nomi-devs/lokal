import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { ListAdminPaymentsQueryDto } from './dto/list-admin-payments-query.dto';
import {
  AdminPaymentRowDto,
  AdminPaymentsListResponseDto,
} from './dto/admin-payment-response.dto';

// Read-only reporting view — see AdminPaymentRowDto for why there's no
// separate Payment collection behind this.
@ApiTags('Admin - Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly vendorsService: VendorsService,
  ) {}

  @ApiOkResponse({ type: AdminPaymentsListResponseDto })
  @Get()
  async list(
    @Query() query: ListAdminPaymentsQueryDto,
  ): Promise<AdminPaymentsListResponseDto> {
    const { data: orders, total } = await this.ordersService.listForAdmin({
      page: query.page,
      limit: query.limit,
      vendorId: query.vendorId,
    });

    const [users, vendors] = await Promise.all([
      this.usersService.findManyByIds(orders.map((o) => o.customerId)),
      Promise.all(orders.map((o) => this.vendorsService.findById(o.storeId))),
    ]);
    const userById = new Map(users.map((u) => [u.id, u]));

    const data: AdminPaymentRowDto[] = orders.map((order, i) => {
      const user = userById.get(order.customerId);
      const vendor = vendors[i];
      return {
        id: order.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerName: user ? `${user.firstName} ${user.lastName}`.trim() : '',
        customerEmail: user?.email,
        vendorId: order.storeId,
        vendorName: vendor?.storeName ?? '',
        amount: order.total,
        paymentMethodType: order.paymentMethodType,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      };
    });

    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }
}
