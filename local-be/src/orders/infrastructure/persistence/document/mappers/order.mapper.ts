import { Types } from 'mongoose';
import { Order, OrderItem } from '../../../../domain/order';
import { OrderSchemaClass } from '../entities/order.schema';

export class OrderMapper {
  static toDomain(raw: OrderSchemaClass): Order {
    const domainEntity = new Order();
    domainEntity.id = raw._id.toString();
    domainEntity.orderNumber = raw.orderNumber;
    domainEntity.customerId = raw.customerId.toString();
    domainEntity.storeId = raw.storeId.toString();
    domainEntity.checkoutSessionId = raw.checkoutSessionId.toString();
    domainEntity.items = raw.items.map((item) => {
      const domainItem = new OrderItem();
      domainItem.productId = item.productId.toString();
      domainItem.name = { en: item.name.en, ar: item.name.ar };
      domainItem.size = item.size;
      domainItem.color = item.color;
      domainItem.qty = item.qty;
      domainItem.unitPrice = item.unitPrice;
      return domainItem;
    });
    domainEntity.subtotal = raw.subtotal;
    domainEntity.deliveryFee = raw.deliveryFee;
    domainEntity.total = raw.total;
    domainEntity.commissionPercentSnapshot = raw.commissionPercentSnapshot;
    domainEntity.addressSnapshot = { ...raw.addressSnapshot };
    domainEntity.paymentMethodType = raw.paymentMethodType;
    domainEntity.paymentStatus = raw.paymentStatus;
    domainEntity.status = raw.status;
    domainEntity.statusHistory = raw.statusHistory.map((entry) => ({
      status: entry.status,
      note: entry.note,
      timestamp: entry.timestamp,
    }));
    domainEntity.driver = raw.driver ? { ...raw.driver } : undefined;
    domainEntity.createdAt = raw.createdAt as Date;
    domainEntity.updatedAt = raw.updatedAt as Date;
    return domainEntity;
  }

  static toPersistence(
    domainEntity: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  ): Partial<OrderSchemaClass> {
    return {
      orderNumber: domainEntity.orderNumber,
      customerId: new Types.ObjectId(domainEntity.customerId),
      storeId: new Types.ObjectId(domainEntity.storeId),
      checkoutSessionId: new Types.ObjectId(domainEntity.checkoutSessionId),
      items: domainEntity.items.map((item) => ({
        productId: new Types.ObjectId(item.productId),
        name: item.name,
        size: item.size,
        color: item.color,
        qty: item.qty,
        unitPrice: item.unitPrice,
      })),
      subtotal: domainEntity.subtotal,
      deliveryFee: domainEntity.deliveryFee,
      total: domainEntity.total,
      commissionPercentSnapshot: domainEntity.commissionPercentSnapshot,
      addressSnapshot: domainEntity.addressSnapshot,
      paymentMethodType: domainEntity.paymentMethodType,
      paymentStatus: domainEntity.paymentStatus,
      status: domainEntity.status,
      statusHistory: domainEntity.statusHistory,
      driver: domainEntity.driver,
    };
  }

  static statusUpdateToPersistence(
    payload: Partial<Order>,
  ): Partial<OrderSchemaClass> {
    const persistence: Partial<OrderSchemaClass> = {};
    if (payload.status !== undefined) persistence.status = payload.status;
    if (payload.paymentStatus !== undefined)
      persistence.paymentStatus = payload.paymentStatus;
    if (payload.statusHistory !== undefined)
      persistence.statusHistory = payload.statusHistory;
    if (payload.driver !== undefined) persistence.driver = payload.driver;
    return persistence;
  }
}
