import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { OrdersService } from './orders.service';
import { ListCustomerOrdersQueryDto } from './dto/list-customer-orders-query.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import {
  OrderResponseDto,
  OrdersListResponseDto,
} from './dto/order-response.dto';
import { OrderInvoiceResponseDto } from './dto/order-invoice-response.dto';

// Customer order history/detail — see CheckoutController for order creation
// (POST /orders, not under this /me/orders prefix).
@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('me/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOkResponse({ type: OrdersListResponseDto })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: ListCustomerOrdersQueryDto,
  ): Promise<OrdersListResponseDto> {
    const { data, total } = await this.ordersService.listForCustomer(
      currentUser.userId,
      query.tab,
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
    const order = await this.ordersService.getForCustomerOrThrow(
      currentUser.userId,
      id,
    );
    return { success: true, order };
  }

  @ApiOkResponse({ type: OrderInvoiceResponseDto })
  @Get(':id/invoice')
  async invoice(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<OrderInvoiceResponseDto> {
    const invoice = await this.ordersService.getInvoiceForCustomer(
      currentUser.userId,
      id,
    );
    return { success: true, invoice };
  }

  @ApiOkResponse({ type: OrderResponseDto })
  @Post(':id/cancel')
  async cancel(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.cancelForCustomer(
      currentUser.userId,
      id,
      dto,
    );
    return { success: true, order };
  }
}
