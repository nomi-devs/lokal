// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
// Shape mirrors the ORDERS collection in the ERD (items/vendorOrders are denormalized, as specified).
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  productNameEn: string;
  productNameAr: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
};

export type ShippingAddress = {
  name: string;
  country: string;
  city: string;
  phone: string;
  address: string;
};

export type VendorOrderSplit = {
  vendorId: number;
  status: OrderStatus;
  totalAmount: number;
};

export type Order = {
  id: number;
  orderNumber: string;
  userId: number;
  paymentId: number | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  vendorOrders: VendorOrderSplit[];
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
};

export const orders: Order[] = [
  {
    id: 1,
    orderNumber: "ORD-2026-00231",
    userId: 2,
    paymentId: 1,
    items: [
      {
        productNameEn: "Modular Sofa Set",
        productNameAr: "طقم كنب معياري",
        price: 620,
        qty: 1,
        color: "Charcoal",
      },
      {
        productNameEn: "Linen Curtain Panel",
        productNameAr: "ستارة كتان",
        price: 16,
        qty: 2,
        size: "140x260cm",
        color: "Taupe",
      },
    ],
    shippingAddress: {
      name: "Layla Ahmad",
      country: "Kuwait",
      city: "Salmiya",
      phone: "+96560112233",
      address: "Block 4, Street 12",
    },
    subtotal: 652,
    shippingFee: 3,
    total: 655,
    status: "delivered",
    vendorOrders: [{ vendorId: 5, status: "delivered", totalAmount: 655 }],
    createdAt: "2026-08-01",
    updatedAt: "2026-08-06",
    deliveredAt: "2026-08-06",
  },
  {
    id: 2,
    orderNumber: "ORD-2026-00232",
    userId: 13,
    paymentId: 2,
    items: [
      {
        productNameEn: "Oak Dining Table",
        productNameAr: "طاولة طعام بلوط",
        price: 340,
        qty: 1,
        color: "Walnut",
      },
    ],
    shippingAddress: {
      name: "Marcus Webb",
      country: "Kuwait",
      city: "Jabriya",
      phone: "+96560223344",
      address: "Villa 22",
    },
    subtotal: 340,
    shippingFee: 3,
    total: 343,
    status: "confirmed",
    vendorOrders: [{ vendorId: 5, status: "confirmed", totalAmount: 343 }],
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05",
  },
  {
    id: 3,
    orderNumber: "ORD-2026-00233",
    userId: 11,
    paymentId: 3,
    items: [
      {
        productNameEn: "Chrome Bathroom Faucet",
        productNameAr: "خلاط حمام كروم",
        price: 18.5,
        qty: 1,
        color: "Matte Black",
      },
      {
        productNameEn: "Steel Rebar Bundle 12mm",
        productNameAr: "حزمة حديد تسليح 12مم",
        price: 58,
        qty: 3,
      },
    ],
    shippingAddress: {
      name: "Fatima Noor",
      country: "Kuwait",
      city: "Farwaniya",
      phone: "+96560334455",
      address: "Block 1, Street 5",
    },
    subtotal: 192.5,
    shippingFee: 3,
    total: 195.5,
    status: "shipped",
    vendorOrders: [
      { vendorId: 4, status: "shipped", totalAmount: 18.5 },
      { vendorId: 10, status: "shipped", totalAmount: 174 },
    ],
    createdAt: "2026-08-08",
    updatedAt: "2026-08-10",
  },
  {
    id: 4,
    orderNumber: "ORD-2026-00234",
    userId: 15,
    paymentId: 4,
    items: [
      {
        productNameEn: "Split AC Unit 18000 BTU",
        productNameAr: "مكيف سبليت 18000 وحدة",
        price: 195,
        qty: 1,
      },
    ],
    shippingAddress: {
      name: "James O'Neil",
      country: "Kuwait",
      city: "Kuwait City",
      phone: "+96560445566",
      address: "Tower 3, Sharq",
    },
    subtotal: 195,
    shippingFee: 3,
    total: 198,
    status: "pending",
    vendorOrders: [{ vendorId: 6, status: "pending", totalAmount: 198 }],
    createdAt: "2026-08-13",
    updatedAt: "2026-08-13",
  },
  {
    id: 5,
    orderNumber: "ORD-2026-00235",
    userId: 7,
    paymentId: 5,
    items: [
      {
        productNameEn: "Artificial Grass Roll 2x5m",
        productNameAr: "رول عشب صناعي 2×5م",
        price: 45,
        qty: 2,
        size: "2x5m",
      },
      {
        productNameEn: "LED Panel Light 60x60",
        productNameAr: "لوح إضاءة LED 60×60",
        price: 9.75,
        qty: 4,
      },
    ],
    shippingAddress: {
      name: "Huda Aziz",
      country: "Kuwait",
      city: "Mishref",
      phone: "+96560556677",
      address: "Villa 9",
    },
    subtotal: 129,
    shippingFee: 3,
    total: 132,
    status: "delivered",
    vendorOrders: [
      { vendorId: 3, status: "delivered", totalAmount: 90 },
      { vendorId: 2, status: "delivered", totalAmount: 39 },
    ],
    createdAt: "2026-07-28",
    updatedAt: "2026-08-01",
    deliveredAt: "2026-08-01",
  },
  {
    id: 6,
    orderNumber: "ORD-2026-00236",
    userId: 4,
    paymentId: 6,
    items: [
      {
        productNameEn: "Interior Wall Paint 10L",
        productNameAr: "دهان جدران داخلي 10 لتر",
        price: 22,
        qty: 1,
        color: "Light Grey",
      },
    ],
    shippingAddress: {
      name: "Omar Nasser",
      country: "Kuwait",
      city: "Hawalli",
      phone: "+96560667788",
      address: "Block 7, Street 21",
    },
    subtotal: 22,
    shippingFee: 3,
    total: 25,
    status: "cancelled",
    vendorOrders: [{ vendorId: 7, status: "cancelled", totalAmount: 25 }],
    createdAt: "2026-07-22",
    updatedAt: "2026-07-23",
  },
  {
    id: 7,
    orderNumber: "ORD-2026-00237",
    userId: 13,
    paymentId: 7,
    items: [
      {
        productNameEn: "Split AC Unit 18000 BTU",
        productNameAr: "مكيف سبليت 18000 وحدة",
        price: 195,
        qty: 1,
      },
      {
        productNameEn: "Circuit Breaker 32A",
        productNameAr: "قاطع كهرباء 32 أمبير",
        price: 4.2,
        qty: 5,
      },
    ],
    shippingAddress: {
      name: "Sara Malik",
      country: "Kuwait",
      city: "Ahmadi",
      phone: "+96560778899",
      address: "Villa 15",
    },
    subtotal: 216,
    shippingFee: 3,
    total: 219,
    status: "confirmed",
    vendorOrders: [
      { vendorId: 6, status: "confirmed", totalAmount: 195 },
      { vendorId: 2, status: "confirmed", totalAmount: 21 },
    ],
    createdAt: "2026-08-14",
    updatedAt: "2026-08-14",
  },
  {
    id: 8,
    orderNumber: "ORD-2026-00238",
    userId: 11,
    paymentId: 8,
    items: [
      {
        productNameEn: "Steel Rebar Bundle 12mm",
        productNameAr: "حزمة حديد تسليح 12مم",
        price: 58,
        qty: 10,
      },
    ],
    shippingAddress: {
      name: "Bader Salem",
      country: "Kuwait",
      city: "Ahmadi",
      phone: "+96560889900",
      address: "Plot 3, Industrial Area",
    },
    subtotal: 580,
    shippingFee: 3,
    total: 583,
    status: "pending",
    vendorOrders: [{ vendorId: 10, status: "pending", totalAmount: 583 }],
    createdAt: "2026-08-15",
    updatedAt: "2026-08-15",
  },
];

// Single source of truth for "total revenue" — every page showing this figure
// (Orders, Overview, Analytics) should import it rather than recompute its own.
export const totalRevenue = orders
  .filter((o) => o.status !== "cancelled")
  .reduce((sum, o) => sum + o.total, 0); 