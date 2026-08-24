import { IsInt, IsString } from 'class-validator';

export class CheckoutDto {
  @IsString()
  addressId: string;

  // MyFatoorah PaymentMethodId — from GET /me/payment-methods (see
  // PaymentsController.listMethods).
  @IsInt()
  paymentMethodId: number;
}
