// requested -> approved -> completed, or requested -> rejected. 'rejected'
// and 'completed' are terminal — see RefundsService.moderate.
export const REFUND_STATUSES = [
  'requested',
  'approved',
  'rejected',
  'completed',
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];
