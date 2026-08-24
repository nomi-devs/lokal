import { Wishlist } from '../../../../domain/wishlist';
import { WishlistSchemaClass } from '../entities/wishlist.schema';

export class WishlistMapper {
  static toDomain(raw: WishlistSchemaClass): Wishlist {
    const domainEntity = new Wishlist();
    domainEntity.id = raw._id.toString();
    domainEntity.userId = raw.userId.toString();
    domainEntity.productId = raw.productId.toString();
    domainEntity.createdAt = raw.createdAt as Date;
    return domainEntity;
  }
}
