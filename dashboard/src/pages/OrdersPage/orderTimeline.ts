import type { OrderStatus } from "@/lib/ordersApi";

// Canonical lifecycle (see local-be's orders.constants.ts) — 'cancelled' is
// a separate one-directional branch, not shown on this forward timeline.
export const ORDER_TIMELINE: OrderStatus[] = ["placed", "confirmed", "in_transit", "delivered"];
