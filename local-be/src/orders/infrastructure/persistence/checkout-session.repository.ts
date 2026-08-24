import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { CheckoutSession } from '../../domain/checkout-session';

export abstract class CheckoutSessionRepository {
  abstract create(
    data: Omit<CheckoutSession, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CheckoutSession>;

  abstract findById(id: string): Promise<NullableType<CheckoutSession>>;

  // The MyFatoorah callback/error redirect only carries a `paymentId` query
  // param (see payments.service.ts::getPaymentStatus, which resolves that
  // to an InvoiceId) — this is how OrdersService.finalizeCheckout finds its
  // way back to the session that started the payment, without needing to
  // pre-generate and embed our own id in the CallBackUrl.
  abstract findByInvoiceId(
    invoiceId: string,
  ): Promise<NullableType<CheckoutSession>>;

  abstract update(
    id: string,
    payload: DeepPartial<CheckoutSession>,
  ): Promise<NullableType<CheckoutSession>>;

  // Atomically flips a *pending* session straight to 'paid', returning the
  // pre-update session (still carrying its order drafts) only if this call
  // is the one that actually won the transition. Two near-simultaneous
  // MyFatoorah callback hits for the same payment (e.g. a browser refresh)
  // must create the vendor orders exactly once — see
  // OrdersService.finalizeCheckout, which treats a null return here as
  // "someone else already claimed it" and backs off instead of duplicating
  // the orders.
  abstract claimPendingForFinalization(
    id: string,
  ): Promise<NullableType<CheckoutSession>>;
}
