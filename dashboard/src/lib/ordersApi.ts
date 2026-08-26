import { apiClient, listPaginated } from "./apiClient";

// Mirrors local-be's orders/domain/order.ts. Canonical lifecycle:
// placed -> confirmed -> in_transit -> delivered, plus a one-directional
// "cancelled" (customer-only, before the vendor starts preparing). Admin is
// read-only here — only the owning vendor can advance status/set the driver
// (PATCH /vendor/orders/:id/status), and only the customer can cancel.
export type OrderStatus = "placed" | "confirmed" | "in_transit" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  name: { en: string; ar?: string };
  size?: string;
  color?: string;
  qty: number;
  unitPrice: number;
}

export interface OrderAddressSnapshot {
  label: "home" | "office" | "other";
  name: string;
  country?: string;
  city: string;
  phone: string;
  addressLine: string;
}

export interface OrderDriver {
  name: string;
  phone: string;
  photoUrl?: string;
  vehicleInfo?: string;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  note?: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  storeId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  commissionPercentSnapshot: number;
  addressSnapshot: OrderAddressSnapshot;
  paymentMethodType: string;
  paymentStatus: "pending" | "paid" | "failed";
  status: OrderStatus;
  statusHistory: OrderStatusHistoryEntry[];
  driver?: OrderDriver;
  createdAt: string;
  updatedAt: string;
  // DataTable's RowData constraint requires an index signature.
  [key: string]: unknown;
}

// ── Admin (GET /admin/orders) — read-only ──────────────────────────────────

export interface ListAdminOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  vendorId?: string;
}

export async function listAdminOrders(params: ListAdminOrdersParams = {}) {
  return listPaginated<Order>("/admin/orders", params);
}

export async function getAdminOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<{ success: true; order: Order }>(`/admin/orders/${id}`);

  return data.order;
}

// ── Vendor self-service (GET/PATCH /vendor/orders) ─────────────────────────

export interface ListVendorOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export async function listVendorOrders(params: ListVendorOrdersParams = {}) {
  return listPaginated<Order>("/vendor/orders", params);
}

export async function getVendorOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<{ success: true; order: Order }>(`/vendor/orders/${id}`);

  return data.order;
}

// Only 'confirmed' | 'in_transit' | 'delivered' are vendor-triggerable —
// 'placed' happens automatically at creation, 'cancelled' is customer-only.
export interface UpdateVendorOrderStatusPayload {
  status: "confirmed" | "in_transit" | "delivered";
  note?: string;
  driver?: OrderDriver;
}

export async function updateVendorOrderStatus(
  id: string,
  payload: UpdateVendorOrderStatusPayload
): Promise<Order> {
  const { data } = await apiClient.patch<{ success: true; order: Order }>(
    `/vendor/orders/${id}/status`,
    payload
  );

  return data.order;
}
