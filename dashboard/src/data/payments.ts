// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
// Shape mirrors the PAYMENTS collection in the ERD (1:1 with an order).
export type PaymentMethod = "knet" | "credit_card" | "debit_card";
export type PaymentGateway = "myfatoorah" | "tap";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type Payment = {
  id: number;
  orderId: number;
  userId: number;
  amount: number;
  currency: "KWD" | "SAR";
  method: PaymentMethod;
  gateway: PaymentGateway;
  transactionId: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export const payments: Payment[] = [
  {
    id: 1,
    orderId: 1,
    userId: 2,
    amount: 655,
    currency: "KWD",
    method: "knet",
    gateway: "myfatoorah",
    transactionId: "TXN-0083920145",
    status: "success",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
  },
  {
    id: 2,
    orderId: 2,
    userId: 13,
    amount: 343,
    currency: "KWD",
    method: "credit_card",
    gateway: "tap",
    transactionId: "TXN-0083920312",
    status: "success",
    createdAt: "2026-08-05",
    updatedAt: "2026-08-05",
  },
  {
    id: 3,
    orderId: 3,
    userId: 11,
    amount: 195.5,
    currency: "KWD",
    method: "knet",
    gateway: "myfatoorah",
    transactionId: "TXN-0083920587",
    status: "success",
    createdAt: "2026-08-08",
    updatedAt: "2026-08-08",
  },
  {
    id: 4,
    orderId: 4,
    userId: 15,
    amount: 198,
    currency: "KWD",
    method: "debit_card",
    gateway: "tap",
    transactionId: "TXN-0083921004",
    status: "success",
    createdAt: "2026-08-13",
    updatedAt: "2026-08-13",
  },
  {
    id: 5,
    orderId: 5,
    userId: 7,
    amount: 132,
    currency: "KWD",
    method: "knet",
    gateway: "myfatoorah",
    transactionId: "TXN-0083919871",
    status: "success",
    createdAt: "2026-07-28",
    updatedAt: "2026-07-28",
  },
  {
    id: 6,
    orderId: 6,
    userId: 4,
    amount: 25,
    currency: "KWD",
    method: "credit_card",
    gateway: "tap",
    transactionId: "TXN-0083919650",
    status: "failed",
    createdAt: "2026-07-22",
    updatedAt: "2026-07-23",
  },
  {
    id: 7,
    orderId: 7,
    userId: 13,
    amount: 219,
    currency: "KWD",
    method: "knet",
    gateway: "myfatoorah",
    transactionId: "TXN-0083921188",
    status: "success",
    createdAt: "2026-08-14",
    updatedAt: "2026-08-14",
  },
  {
    id: 8,
    orderId: 8,
    userId: 11,
    amount: 583,
    currency: "KWD",
    method: "knet",
    gateway: "myfatoorah",
    transactionId: "TXN-0083921259",
    status: "pending",
    createdAt: "2026-08-15",
    updatedAt: "2026-08-15",
  },
  {
    id: 9,
    orderId: 3,
    userId: 11,
    amount: 195.5,
    currency: "KWD",
    method: "knet",
    gateway: "myfatoorah",
    transactionId: "TXN-0083920480",
    status: "failed",
    createdAt: "2026-08-08",
    updatedAt: "2026-08-08",
  },
];
