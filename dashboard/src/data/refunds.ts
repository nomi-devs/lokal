// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
// Not part of the original ERD — admin-only refund workflow, modeled the same way as the
// other admin collections (typed array + derived display state computed at read time).
// Dates are ISO strings (not Date objects) to match the rest of src/data/*.ts.
export type RefundStatus = "requested" | "approved" | "rejected" | "completed";

export type RefundOrderItem = {
  productName: string;
  quantity: number;
  price: number;
};

export type RefundBankAccount = {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
};

export type RefundRequest = {
  id: string;
  orderId: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  refundAmount: number;
  refundReason: string;
  customerExplanation: string;
  bankAccount: RefundBankAccount;
  status: RefundStatus;
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalNotes?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  rejectionCategory?: string;
  proofOfTransferUrl?: string;
  completedAt?: string;
  orderDate: string;
  orderTotal: number;
  orderItems: RefundOrderItem[];
  deliveryAddress: string;
};

export const refunds: RefundRequest[] = [
  {
    id: "RF-001",
    orderId: "ORD-20260115-00001",
    userId: 1,
    customerName: "John Doe",
    customerEmail: "john@example.com",
    refundAmount: 100,
    refundReason: "Product damaged",
    customerExplanation: "Arrived damaged with visible cracks.",
    bankAccount: {
      accountHolder: "John Doe",
      accountNumber: "1234567890",
      bankName: "Kuwait Bank",
      bankCode: "KB123",
    },
    status: "requested",
    requestedAt: "2026-08-15T10:30:00Z",
    orderDate: "2026-08-10T09:00:00Z",
    orderTotal: 250,
    orderItems: [{ productName: "Brown Coat", quantity: 1, price: 100 }],
    deliveryAddress: "123 Main St, Kuwait",
  },
  {
    id: "RF-002",
    orderId: "ORD-20260114-00002",
    userId: 2,
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    refundAmount: 75,
    refundReason: "Wrong size received",
    customerExplanation: "Ordered M but got S.",
    bankAccount: {
      accountHolder: "Jane Smith",
      accountNumber: "9876543210",
      bankName: "Gulf Bank",
      bankCode: "GB456",
    },
    status: "approved",
    requestedAt: "2026-08-14T14:00:00Z",
    approvedAt: "2026-08-15T09:00:00Z",
    approvedBy: "admin@gmail.com",
    approvalNotes: "Verified with customer service.",
    proofOfTransferUrl: "https://s3.amazonaws.com/proof-rf-002.jpg",
    orderDate: "2026-08-08T09:00:00Z",
    orderTotal: 150,
    orderItems: [{ productName: "Brown Coat", quantity: 1, price: 75 }],
    deliveryAddress: "456 Oak Ave, Kuwait",
  },
  {
    id: "RF-003",
    orderId: "ORD-20260113-00003",
    userId: 3,
    customerName: "Ahmed Ali",
    customerEmail: "ahmed@example.com",
    refundAmount: 200,
    refundReason: "Duplicate order",
    customerExplanation: "Ordered twice by mistake.",
    bankAccount: {
      accountHolder: "Ahmed Ali",
      accountNumber: "5555555555",
      bankName: "Central Bank",
      bankCode: "CB789",
    },
    status: "rejected",
    requestedAt: "2026-08-13T16:20:00Z",
    rejectedAt: "2026-08-14T10:00:00Z",
    rejectionReason: "Already delivered, no return within window.",
    rejectionCategory: "returnWindow",
    orderDate: "2026-08-05T09:00:00Z",
    orderTotal: 500,
    orderItems: [{ productName: "Electronic Item", quantity: 1, price: 200 }],
    deliveryAddress: "789 Pine Rd, Kuwait",
  },
  {
    id: "RF-004",
    orderId: "ORD-20260112-00004",
    userId: 4,
    customerName: "Fatima Noor",
    customerEmail: "fatima@example.com",
    refundAmount: 45,
    refundReason: "Item not as described",
    customerExplanation: "Color was different from the listing photos.",
    bankAccount: {
      accountHolder: "Fatima Noor",
      accountNumber: "1122334455",
      bankName: "National Bank of Kuwait",
      bankCode: "NBK001",
    },
    status: "completed",
    requestedAt: "2026-08-10T11:15:00Z",
    approvedAt: "2026-08-11T08:30:00Z",
    approvedBy: "admin@gmail.com",
    approvalNotes: "Approved after photo review.",
    proofOfTransferUrl: "https://s3.amazonaws.com/proof-rf-004.jpg",
    completedAt: "2026-08-12T12:00:00Z",
    orderDate: "2026-08-06T09:00:00Z",
    orderTotal: 90,
    orderItems: [{ productName: "Silk Scarf", quantity: 1, price: 45 }],
    deliveryAddress: "22 Salmiya St, Kuwait",
  },
  {
    id: "RF-005",
    orderId: "ORD-20260111-00005",
    userId: 5,
    customerName: "Omar Khalid",
    customerEmail: "omar@example.com",
    refundAmount: 320,
    refundReason: "Item never arrived",
    customerExplanation: "Tracking shows delivered but package never received.",
    bankAccount: {
      accountHolder: "Omar Khalid",
      accountNumber: "6677889900",
      bankName: "Burgan Bank",
      bankCode: "BB210",
    },
    status: "requested",
    requestedAt: "2026-08-18T08:45:00Z",
    orderDate: "2026-08-12T09:00:00Z",
    orderTotal: 320,
    orderItems: [
      { productName: "Leather Bag", quantity: 1, price: 220 },
      { productName: "Wallet", quantity: 1, price: 100 },
    ],
    deliveryAddress: "9 Hawally Ave, Kuwait",
  },
  {
    id: "RF-006",
    orderId: "ORD-20260109-00006",
    userId: 6,
    customerName: "Layla Hassan",
    customerEmail: "layla@example.com",
    refundAmount: 60,
    refundReason: "Changed my mind",
    customerExplanation: "No longer needed, would like to return.",
    bankAccount: {
      accountHolder: "Layla Hassan",
      accountNumber: "3344556677",
      bankName: "Kuwait Bank",
      bankCode: "KB123",
    },
    status: "rejected",
    requestedAt: "2026-08-09T13:10:00Z",
    rejectedAt: "2026-08-10T09:40:00Z",
    rejectionReason: "Item was final sale, not eligible for return.",
    rejectionCategory: "warranty",
    orderDate: "2026-08-02T09:00:00Z",
    orderTotal: 60,
    orderItems: [{ productName: "Sunglasses", quantity: 1, price: 60 }],
    deliveryAddress: "15 Farwaniya Rd, Kuwait",
  },
];
