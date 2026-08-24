// Canonical order status enum — one-directional: placed -> confirmed ->
// in_transit -> delivered, with 'cancelled' reachable only from placed/confirmed
// (see OrdersService).
export const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'in_transit',
  'delivered',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Vendor-facing PATCH /vendor/orders/:id/status only ever moves an order
// forward one step at a time. 'placed' isn't reachable here (orders are
// only ever created already-paid, see OrdersService.finalizeCheckout) and
// 'confirmed' has no legal predecessor in this table, so a vendor "accepting"
// an order is really just the from-placed->confirmed step happening
// automatically at creation — this map exists so a vendor can never skip
// straight to in_transit/delivered or move an already-terminal order.
export const VENDOR_ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ['confirmed'],
  confirmed: ['in_transit'],
  in_transit: ['delivered'],
  delivered: [],
  cancelled: [],
};

// Cancel (customer-triggered) is only allowed before the vendor has started
// preparing the order.
export const CANCELLABLE_STATUSES: OrderStatus[] = ['placed', 'confirmed'];

// GET /me/orders?tab= grouping.
export const TAB_STATUSES: Record<
  'active' | 'previous' | 'canceled',
  OrderStatus[]
> = {
  active: ['placed', 'confirmed', 'in_transit'],
  previous: ['delivered'],
  canceled: ['cancelled'],
};
