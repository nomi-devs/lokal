import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { CartService } from '../cart/cart.service';
import { PaymentsService } from './payments.service';
import { PaymentMethodsResponseDto } from './dto/payment-methods-response.dto';

// Lists MyFatoorah payment methods priced for the customer's *current* cart
// total, so the fees/surcharges shown match what checkout will actually
// charge — the client picks a paymentMethodId from here and passes it to
// POST /orders.
@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('me/payment-methods')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly cartService: CartService,
  ) {}

  @ApiOkResponse({ type: PaymentMethodsResponseDto })
  @Get()
  async listMethods(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PaymentMethodsResponseDto> {
    const cart = await this.cartService.getForUser(currentUser.userId);
    if (cart.items.length === 0) {
      throw new AppException(ERROR_CODES.CART_EMPTY, 'Cart is empty', 422);
    }

    const data = await this.paymentsService.listPaymentMethods(cart.total);
    return { success: true, data };
  }
}
