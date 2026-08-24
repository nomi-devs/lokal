import { Types } from 'mongoose';
import { CheckoutSession } from '../../../../domain/checkout-session';
import { CheckoutSessionSchemaClass } from '../entities/checkout-session.schema';

export class CheckoutSessionMapper {
  static toDomain(raw: CheckoutSessionSchemaClass): CheckoutSession {
    const domainEntity = new CheckoutSession();
    domainEntity.id = raw._id.toString();
    domainEntity.userId = raw.userId.toString();
    domainEntity.addressSnapshot = { ...raw.addressSnapshot };
    domainEntity.paymentMethodType = raw.paymentMethodType;
    domainEntity.orders = raw.orders.map((draft) => ({
      storeId: draft.storeId.toString(),
      items: draft.items.map((item) => ({
        productId: item.productId.toString(),
        name: { en: item.name.en, ar: item.name.ar },
        size: item.size,
        color: item.color,
        qty: item.qty,
        unitPrice: item.unitPrice,
      })),
      subtotal: draft.subtotal,
      deliveryFee: draft.deliveryFee,
      total: draft.total,
      commissionPercentSnapshot: draft.commissionPercentSnapshot,
    }));
    domainEntity.totalAmount = raw.totalAmount;
    domainEntity.cartItemIds = raw.cartItemIds.map((id) => id.toString());
    domainEntity.myFatoorahInvoiceId = raw.myFatoorahInvoiceId;
    domainEntity.status = raw.status as CheckoutSession['status'];
    domainEntity.createdAt = raw.createdAt as Date;
    domainEntity.updatedAt = raw.updatedAt as Date;
    return domainEntity;
  }

  static toPersistence(
    domainEntity: Omit<CheckoutSession, 'id' | 'createdAt' | 'updatedAt'>,
  ): Partial<CheckoutSessionSchemaClass> {
    return {
      userId: new Types.ObjectId(domainEntity.userId),
      addressSnapshot: domainEntity.addressSnapshot,
      paymentMethodType: domainEntity.paymentMethodType,
      orders: domainEntity.orders.map((draft) => ({
        storeId: new Types.ObjectId(draft.storeId),
        items: draft.items.map((item) => ({
          productId: new Types.ObjectId(item.productId),
          name: item.name,
          size: item.size,
          color: item.color,
          qty: item.qty,
          unitPrice: item.unitPrice,
        })),
        subtotal: draft.subtotal,
        deliveryFee: draft.deliveryFee,
        total: draft.total,
        commissionPercentSnapshot: draft.commissionPercentSnapshot,
      })),
      totalAmount: domainEntity.totalAmount,
      cartItemIds: domainEntity.cartItemIds.map((id) => new Types.ObjectId(id)),
      myFatoorahInvoiceId: domainEntity.myFatoorahInvoiceId,
      status: domainEntity.status,
    };
  }

  static updateToPersistence(
    payload: Partial<CheckoutSession>,
  ): Partial<CheckoutSessionSchemaClass> {
    const persistence: Partial<CheckoutSessionSchemaClass> = {};
    if (payload.status !== undefined) persistence.status = payload.status;
    if (payload.myFatoorahInvoiceId !== undefined)
      persistence.myFatoorahInvoiceId = payload.myFatoorahInvoiceId;
    return persistence;
  }
}
