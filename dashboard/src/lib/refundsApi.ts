import { apiClient, listPaginated } from "./apiClient";

// Mirrors local-be's refunds/domain/refund.ts + RefundWithContextDto.
// requested -> approved -> completed, or requested -> rejected — 'rejected'
// and 'completed' are terminal (see local-be's RefundsService.moderate).
export type RefundStatus = "requested" | "approved" | "rejected" | "completed";

export interface RefundBankAccount {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
}

export interface AdminRefund {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  refundAmount: number;
  orderTotal: number;
  refundReason: string;
  customerExplanation?: string;
  bankAccount: RefundBankAccount;
  status: RefundStatus;
  approvedAt?: string;
  approvedBy?: string;
  approvalNotes?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  rejectionCategory?: string;
  proofOfTransferUrl?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

export interface ListAdminRefundsParams {
  page?: number;
  limit?: number;
  status?: RefundStatus;
}

export async function listAdminRefunds(params: ListAdminRefundsParams = {}) {
  return listPaginated<AdminRefund>("/admin/refunds", params);
}

export async function approveRefund(id: string, approvalNotes?: string): Promise<AdminRefund> {
  const { data } = await apiClient.patch<{ success: true; refund: AdminRefund }>(
    `/admin/refunds/${id}/status`,
    { status: "approved", approvalNotes }
  );

  return data.refund;
}

export async function rejectRefund(
  id: string,
  rejectionReason: string,
  rejectionCategory?: string
): Promise<AdminRefund> {
  const { data } = await apiClient.patch<{ success: true; refund: AdminRefund }>(
    `/admin/refunds/${id}/status`,
    { status: "rejected", rejectionReason, rejectionCategory }
  );

  return data.refund;
}

export async function completeRefund(id: string, proofOfTransferUrl: string): Promise<AdminRefund> {
  const { data } = await apiClient.patch<{ success: true; refund: AdminRefund }>(
    `/admin/refunds/${id}/status`,
    { status: "completed", proofOfTransferUrl }
  );

  return data.refund;
}
