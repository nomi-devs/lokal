import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { Order } from '../../../../domain/order';
import { ListOrdersFilters, OrderRepository } from '../../order.repository';
import {
  OrderSchemaClass,
  OrderSchemaDocument,
} from '../entities/order.schema';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class OrderDocumentRepository implements OrderRepository {
  constructor(
    @InjectModel(OrderSchemaClass.name)
    private readonly orderModel: Model<OrderSchemaDocument>,
  ) {}

  async create(
    data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Order> {
    const created = await this.orderModel.create(
      OrderMapper.toPersistence(data),
    );
    return OrderMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<Order>> {
    if (!Types.ObjectId.isValid(id)) return null;
    const found = await this.orderModel.findById(id);
    return found ? OrderMapper.toDomain(found) : null;
  }

  async findManyByCheckoutSessionId(
    checkoutSessionId: string,
  ): Promise<Order[]> {
    const found = await this.orderModel.find({
      checkoutSessionId: new Types.ObjectId(checkoutSessionId),
    });
    return found.map((o) => OrderMapper.toDomain(o));
  }

  async findManyWithPagination(
    filters: ListOrdersFilters,
  ): Promise<{ data: Order[]; total: number }> {
    const query: QueryFilter<OrderSchemaDocument> = {};
    if (filters.customerId)
      query.customerId = new Types.ObjectId(filters.customerId);
    if (filters.storeId) query.storeId = new Types.ObjectId(filters.storeId);
    if (filters.status && filters.status.length > 0)
      query.status = { $in: filters.status };

    const [data, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit),
      this.orderModel.countDocuments(query),
    ]);

    return { data: data.map((o) => OrderMapper.toDomain(o)), total };
  }

  async update(
    id: string,
    payload: DeepPartial<Order>,
  ): Promise<NullableType<Order>> {
    const updated = await this.orderModel.findByIdAndUpdate(
      id,
      OrderMapper.statusUpdateToPersistence(payload as Partial<Order>),
      { new: true },
    );
    return updated ? OrderMapper.toDomain(updated) : null;
  }
}
