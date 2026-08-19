import { products } from "@/data/products";
import type { Review } from "@/data/reviews";

/**
 * Recomputes a product's displayed rating from its approved reviews and writes it back onto the
 * shared `products` array in place. Every page clones `products` into local state on mount (same
 * mock-data pattern used across the app), so this keeps ratings correct for any page mounted after
 * the change without introducing a global store just for this.
 */
export function recomputeProductRating(productId: number, reviews: Review[]) {
  const approved = reviews.filter((r) => r.productId === productId && r.status === "approved");
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return;
  }

  const count = approved.length;
  const average = count ? approved.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  product.ratings = { average: Math.round(average * 10) / 10, count };
}
