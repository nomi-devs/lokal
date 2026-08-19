import { orders, type Order, type OrderStatus } from "@/data/orders";
import { products } from "@/data/products";

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

// There's no NOTIFICATIONS-per-vendor collection in the mock data, so notifications are
// derived from the vendor's real orders/products (new orders, stock levels) rather than a
// disconnected mock file — same convention as vendor analytics.
export type VendorNotificationKind = "newOrder" | "lowStock" | "outOfStock" | "welcome";
export type VendorNotificationType = "Info" | "Warning" | "Alert" | "System";
export type VendorNotificationPriority = "Normal" | "High" | "Critical";

export type VendorNotificationRow = {
  id: string;
  kind: VendorNotificationKind;
  params: Record<string, string | number>;
  type: VendorNotificationType;
  priority: VendorNotificationPriority;
  sentAt: string;
  read: boolean;
};

const LOW_STOCK_THRESHOLD = 15;

export function getVendorNotifications(vendorId: number): VendorNotificationRow[] {
  const rows: VendorNotificationRow[] = [];

  getVendorOrders(vendorId).forEach(({ order, status, amount }) => {
    rows.push({
      id: `order-${order.id}`,
      kind: "newOrder",
      params: { orderNumber: order.orderNumber, amount },
      type: "Info",
      priority: status === "pending" ? "High" : "Normal",
      sentAt: order.createdAt,
      read: status !== "pending",
    });
  });

  products
    .filter((p) => p.vendorId === vendorId)
    .forEach((p) => {
      if (p.status === "out_of_stock") {
        rows.push({
          id: `stock-${p.id}`,
          kind: "outOfStock",
          params: { name: p.nameEn },
          type: "Alert",
          priority: "Critical",
          sentAt: p.updatedAt,
          read: false,
        });
      } else if (p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD) {
        rows.push({
          id: `stock-${p.id}`,
          kind: "lowStock",
          params: { name: p.nameEn, stock: p.stock },
          type: "Warning",
          priority: "High",
          sentAt: p.updatedAt,
          read: false,
        });
      }
    });

  rows.push({
    id: "welcome",
    kind: "welcome",
    params: {},
    type: "System",
    priority: "Normal",
    sentAt: "2026-01-01",
    read: true,
  });

  return rows.sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
}
