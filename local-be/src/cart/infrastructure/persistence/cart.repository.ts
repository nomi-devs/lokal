import { NullableType } from '../../../utils/types/nullable.type';
import { Cart, CartItem } from '../../domain/cart';

export abstract class CartRepository {
  abstract findByUserId(userId: string): Promise<NullableType<Cart>>;

  abstract createEmpty(userId: string): Promise<Cart>;

  // Replaces the whole items array in one write — carts are single-user,
  // low-contention documents, so read-merge-write in the service is simpler
  // than per-item atomic Mongo update operators. Existing items must keep
  // their `id` so itemId references from earlier reads stay valid.
  abstract replaceItems(
    userId: string,
    items: CartItem[],
  ): Promise<NullableType<Cart>>;
}
