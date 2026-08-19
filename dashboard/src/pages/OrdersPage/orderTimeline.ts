import type { OrderStatus } from "@/data/orders";

// Full timeline — admin/dispatch owns every step, unlike the vendor dialog which stops at
// "ready_for_pickup" (see VendorOrderStatusDialog). Mirrors the mobile app's Order Tracking screen
// (Order Confirmed → Preparing → Pick Up → In Transit → Delivered).
export const ORDER_TIMELINE: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "in_transit",
  "delivered",
];
