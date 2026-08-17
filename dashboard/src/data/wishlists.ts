// Mock data — replace with an API call (e.g. `useQuery`) when wiring up a real backend.
// Shape mirrors the WISHLISTS collection in the ERD.
export type Wishlist = {
  id: number;
  userId: number;
  productId: number;
  addedAt: string;
};

export const wishlists: Wishlist[] = [
  { id: 1, userId: 2, productId: 1, addedAt: "2026-07-20" },
  { id: 2, userId: 2, productId: 9, addedAt: "2026-07-21" },
  { id: 3, userId: 13, productId: 2, addedAt: "2026-07-25" },
  { id: 4, userId: 11, productId: 4, addedAt: "2026-08-01" },
  { id: 5, userId: 11, productId: 8, addedAt: "2026-08-02" },
  { id: 6, userId: 15, productId: 7, addedAt: "2026-08-04" },
  { id: 7, userId: 7, productId: 6, addedAt: "2026-08-06" },
  { id: 8, userId: 4, productId: 3, addedAt: "2026-08-09" },
  { id: 9, userId: 4, productId: 5, addedAt: "2026-08-09" },
  { id: 10, userId: 9, productId: 1, addedAt: "2026-08-12" },
  { id: 11, userId: 5, productId: 10, addedAt: "2026-08-14" },
  { id: 12, userId: 10, productId: 7, addedAt: "2026-08-15" },
];
