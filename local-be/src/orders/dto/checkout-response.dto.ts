import { ApiProperty } from '@nestjs/swagger';

class CheckoutData {
  @ApiProperty({ type: String })
  checkoutSessionId: string;

  // Open in an in-app browser/webview — MyFatoorah redirects back to our
  // callback/error endpoints once the customer finishes there (see
  // orders/payment-callback.controller.ts).
  @ApiProperty({ type: String })
  paymentUrl: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;
}

export class CheckoutResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: CheckoutData })
  checkout: CheckoutData;
}
