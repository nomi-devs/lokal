import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';
import { CartService } from '../cart/cart.service';
import { PaymentsService } from './payments.service';
import { PaymentMethodsResponseDto } from './dto/payment-methods-response.dto';
import { PaymentSessionResponseDto } from './dto/payment-session-response.dto';

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

  // Tokenized-embedded flow (saved cards) — see PaymentsService.initiateSession.
  // The mobile app calls this to get a sessionId for the MyFatoorah client
  // SDK, which either renders an empty card widget (new card, saved if the
  // customer opts in) or lets the customer pick one of the returned
  // savedCards and submit just its CVV. The resulting sessionId is then
  // passed to POST /orders as `sessionId` instead of `paymentMethodId`.
  @ApiOkResponse({ type: PaymentSessionResponseDto })
  @Post('sessions')
  async createSession(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PaymentSessionResponseDto> {
    const session = await this.paymentsService.initiateSession(
      currentUser.userId,
      true,
    );
    return { success: true, session };
  }

  // Deliberately not scoped as /cards/:id off a locally-stored record —
  // there isn't one (MyFatoorah is the only source of truth for saved
  // cards, see initiateSession). Ownership is instead proven by re-deriving
  // this customer's own saved cards and checking the token appears there
  // before canceling it (see PaymentsService.cancelSavedCard).
  @ApiOkResponse({ type: MessageResponseDto })
  @Delete('cards/:token')
  async removeSavedCard(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('token') token: string,
  ): Promise<MessageResponseDto> {
    await this.paymentsService.cancelSavedCard(currentUser.userId, token);
    const msg = MESSAGES.PAYMENT.CARD_REMOVED;
    return { success: true, message: msg.en, messageAr: msg.ar };
  }
}
