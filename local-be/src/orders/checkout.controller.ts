import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutResponseDto } from './dto/checkout-response.dto';

// Root-level (not /me/orders) since it builds from the cart rather than
// addressing an existing order — see OrdersService.checkout for why this
// never creates an Order directly (that only happens once MyFatoorah
// confirms payment, in the callback handler).
@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('orders')
export class CheckoutController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiCreatedResponse({ type: CheckoutResponseDto })
  @Post()
  async checkout(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CheckoutDto,
  ): Promise<CheckoutResponseDto> {
    const checkout = await this.ordersService.checkout(currentUser.userId, dto);
    return { success: true, checkout };
  }
}
