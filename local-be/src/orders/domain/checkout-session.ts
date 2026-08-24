import { OrderAddressSnapshot, OrderItem } from './order';

export interface CheckoutOrderDraft {
  storeId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  commissionPercentSnapshot: number;
}

// A cart frozen at the moment checkout was initiated — persisted purely so
// the MyFatoorah callback (a plain unauthenticated redirect, potentially
// minutes later) has everything it needs to create the real Order(s)
// without touching the customer's live cart or re-pricing products again.
// Never exposed directly via the API.
export class CheckoutSession {
  id: string;
  userId: string;
  addressSnapshot: OrderAddressSnapshot;
  paymentMethodType: string;
  orders: CheckoutOrderDraft[];
  totalAmount: number;
  // Cart item ids being purchased — removed from the cart only once payment
  // is confirmed (see OrdersService.finalizeCheckout); left untouched if
  // payment fails or is abandoned.
  cartItemIds: string[];
  myFatoorahInvoiceId?: string;
  status: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
