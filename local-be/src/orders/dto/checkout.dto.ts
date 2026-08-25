import { IsInt, IsString, ValidateIf } from 'class-validator';

export class CheckoutDto {
  @IsString()
  addressId: string;

  // Exactly one of paymentMethodId / sessionId must be given — mutually
  // exclusive, matching MyFatoorah's own ExecutePayment contract (see
  // PaymentsService.executePayment). The XOR itself is enforced in
  // OrdersService.checkout, not here, since class-validator's ValidateIf
  // can only skip a field's own validation, not compare across fields.

  // Live gateway method (KNET, Visa/Mastercard, ...) — from
  // GET /me/payment-methods (see PaymentsController.listMethods).
  @ValidateIf((o: CheckoutDto) => o.sessionId === undefined)
  @IsInt()
  paymentMethodId?: number;

  // Tokenized-embedded session (new or saved card) — from
  // POST /me/payment-methods/sessions (see PaymentsController.createSession).
  @ValidateIf((o: CheckoutDto) => o.paymentMethodId === undefined)
  @IsString()
  sessionId?: string;
}
