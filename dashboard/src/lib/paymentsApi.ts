import { listPaginated } from "./apiClient";

// Mirrors local-be's AdminPaymentRowDto — a payment "row" is an Order
// projected the way this page wants it, not a separate collection (orders
// are only ever created after MyFatoorah confirms payment, so paymentStatus
// is 'paid' for every row today; 'pending'/'failed' are modeled for
// completeness but currently unreachable — see local-be's admin-payments.controller.ts).
export interface AdminPaymentRow {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  paymentMethodType: string;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export interface ListAdminPaymentsParams {
  page?: number;
  limit?: number;
  vendorId?: string;
}

export async function listAdminPayments(params: ListAdminPaymentsParams = {}) {
  return listPaginated<AdminPaymentRow>("/admin/payments", params);
}
