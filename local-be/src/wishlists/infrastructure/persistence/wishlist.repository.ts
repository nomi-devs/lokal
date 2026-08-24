import { NullableType } from '../../../utils/types/nullable.type';
import { Wishlist } from '../../domain/wishlist';

export abstract class WishlistRepository {
  abstract create(data: {
    userId: string;
    productId: string;
  }): Promise<Wishlist>;

  abstract findManyByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Wishlist[]; total: number }>;

  abstract findOneByUserAndProduct(
    userId: string,
    productId: string,
  ): Promise<NullableType<Wishlist>>;

  abstract remove(id: string): Promise<void>;

  abstract countByUserId(userId: string): Promise<number>;
}
