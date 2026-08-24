import { Types } from 'mongoose';
import { Cart, CartItem } from '../../../../domain/cart';
import { CartSchemaClass } from '../entities/cart.schema';

export class CartMapper {
  static toDomain(raw: CartSchemaClass): Cart {
    const domainEntity = new Cart();
    domainEntity.id = raw._id.toString();
    domainEntity.userId = raw.userId.toString();
    domainEntity.items = raw.items.map((item) => {
      const domainItem = new CartItem();
      domainItem.id = item._id.toString();
      domainItem.productId = item.productId.toString();
      domainItem.storeId = item.storeId.toString();
      domainItem.size = item.size;
      domainItem.color = item.color;
      domainItem.qty = item.qty;
      domainItem.unitPrice = item.unitPrice;
      return domainItem;
    });
    // Computed on read (see CartService.withTotals) — not persisted.
    domainEntity.subtotal = 0;
    domainEntity.deliveryFee = 0;
    domainEntity.total = 0;
    domainEntity.createdAt = raw.createdAt as Date;
    domainEntity.updatedAt = raw.updatedAt as Date;
    return domainEntity;
  }

  static itemToPersistence(item: CartItem): Record<string, unknown> {
    return {
      // Preserve the existing subdocument _id so it keeps matching earlier
      // itemId references; omit it for a brand-new item so Mongoose
      // generates one.
      _id: item.id ? new Types.ObjectId(item.id) : undefined,
      productId: new Types.ObjectId(item.productId),
      storeId: new Types.ObjectId(item.storeId),
      size: item.size,
      color: item.color,
      qty: item.qty,
      unitPrice: item.unitPrice,
    };
  }
}
