import { Controller, Get, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

// Public — hit by the customer's browser/webview being redirected by
// MyFatoorah, not by our own authenticated clients, so it deliberately
// carries no JwtAuthGuard. Both routes do the exact same thing: MyFatoorah
// sends the browser to /callback when the hosted flow *finishes* and to
// /error when it's cancelled/fails, but neither redirect is trustworthy on
// its own (a customer can hand-edit the URL) — OrdersService.finalizeCheckout
// always re-verifies with MyFatoorah's GetPaymentStatus before creating
// anything, so both routes just forward to it. Excluded from Swagger since
// it's not a client-facing endpoint.
@ApiTags('Payments')
@Controller('payments/myfatoorah')
export class PaymentCallbackController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiExcludeEndpoint()
  @Get('callback')
  callback(@Query('paymentId') paymentId: string) {
    return this.handle(paymentId);
  }

  @ApiExcludeEndpoint()
  @Get('error')
  error(@Query('paymentId') paymentId: string) {
    return this.handle(paymentId);
  }

  private async handle(paymentId: string) {
    if (!paymentId) {
      return { success: false, message: 'Missing paymentId' };
    }
    const result = await this.ordersService.finalizeCheckout(paymentId);
    return {
      success: result.success,
      orderNumbers: result.orders.map((o) => o.orderNumber),
    };
  }
}
