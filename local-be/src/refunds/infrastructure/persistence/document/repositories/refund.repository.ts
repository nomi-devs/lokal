import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { Refund } from '../../../../domain/refund';
import {
  AdminListRefundsFilters,
  RefundRepository,
} from '../../refund.repository';
import {
  RefundSchemaClass,
  RefundSchemaDocument,
} from '../entities/refund.schema';
import { RefundMapper } from '../mappers/refund.mapper';

@Injectable()
export class RefundsDocumentRepository implements RefundRepository {
  constructor(
    @InjectModel(RefundSchemaClass.name)
    private readonly refundModel: Model<RefundSchemaDocument>,
  ) {}

  async create(
    data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  ): Promise<Refund> {
    const created = await this.refundModel.create({
      ...RefundMapper.toPersistence(data),
      status: 'requested',
    });
    return RefundMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<Refund>> {
    if (!Types.ObjectId.isValid(id)) return null;
    const found = await this.refundModel.findById(id);
    return found ? RefundMapper.toDomain(found) : null;
  }

  async findOneByOrderId(orderId: string): Promise<NullableType<Refund>> {
    if (!Types.ObjectId.isValid(orderId)) return null;
    const found = await this.refundModel.findOne({
      orderId: new Types.ObjectId(orderId),
    });
    return found ? RefundMapper.toDomain(found) : null;
  }

  async findManyByCustomerId(
    customerId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Refund[]; total: number }> {
    const query = { customerId: new Types.ObjectId(customerId) };
    const [data, total] = await Promise.all([
      this.refundModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.refundModel.countDocuments(query),
    ]);
    return { data: data.map((r) => RefundMapper.toDomain(r)), total };
  }

  async findManyForAdmin(
    filters: AdminListRefundsFilters,
  ): Promise<{ data: Refund[]; total: number }> {
    const query: QueryFilter<RefundSchemaDocument> = {};
    if (filters.status) query.status = filters.status;

    const [data, total] = await Promise.all([
      this.refundModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit),
      this.refundModel.countDocuments(query),
    ]);
    return { data: data.map((r) => RefundMapper.toDomain(r)), total };
  }

  async update(
    id: string,
    payload: DeepPartial<Refund>,
  ): Promise<NullableType<Refund>> {
    const updated = await this.refundModel.findOneAndUpdate(
      { _id: id },
      RefundMapper.toPersistence(payload as Partial<Refund>),
      { new: true },
    );
    return updated ? RefundMapper.toDomain(updated) : null;
  }
}
