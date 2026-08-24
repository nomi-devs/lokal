import { orders, type Order, type OrderStatus } from "@/data/orders";

// Orders are denormalized with a per-vendor split (see src/data/orders.ts) — a single
// order can contain items from several vendors, each with its own status/amount.
// This resolves that split for one vendor so pages don't repeat the lookup.
export interface VendorOrderRow {
  order: Order;
  status: OrderStatus;
  amount: number;
}

export function getVendorOrders(vendorId: number): VendorOrderRow[] {
  return orders.flatMap((order) => {
    const split = order.vendorOrders.find((vo) => vo.vendorId === vendorId);

    return split ? [{ order, status: split.status, amount: split.totalAmount }] : [];
  });
}
