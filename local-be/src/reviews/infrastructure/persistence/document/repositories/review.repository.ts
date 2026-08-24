import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { Review } from '../../../../domain/review';
import {
  AdminListReviewsFilters,
  RatingSummary,
  ReviewRepository,
} from '../../review.repository';
import {
  ReviewSchemaClass,
  ReviewSchemaDocument,
} from '../entities/review.schema';
import { ReviewMapper } from '../mappers/review.mapper';

@Injectable()
export class ReviewsDocumentRepository implements ReviewRepository {
  constructor(
    @InjectModel(ReviewSchemaClass.name)
    private readonly reviewModel: Model<ReviewSchemaDocument>,
  ) {}

  async create(
    data: Omit<
      Review,
      'id' | 'createdAt' | 'updatedAt' | 'approvedAt' | 'rejectionReason'
    >,
  ): Promise<Review> {
    const created = await this.reviewModel.create(
      ReviewMapper.toPersistence(data),
    );
    return ReviewMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<Review>> {
    if (!Types.ObjectId.isValid(id)) return null;
    const found = await this.reviewModel.findById(id);
    return found ? ReviewMapper.toDomain(found) : null;
  }

  async findOneByCustomerOrderProduct(
    customerId: string,
    orderId: string,
    productId: string,
  ): Promise<NullableType<Review>> {
    if (!Types.ObjectId.isValid(orderId) || !Types.ObjectId.isValid(productId))
      return null;
    const found = await this.reviewModel.findOne({
      customerId: new Types.ObjectId(customerId),
      orderId: new Types.ObjectId(orderId),
      productId: new Types.ObjectId(productId),
    });
    return found ? ReviewMapper.toDomain(found) : null;
  }

  async findManyByCustomerId(
    customerId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Review[]; total: number }> {
    const query = { customerId: new Types.ObjectId(customerId) };
    const [data, total] = await Promise.all([
      this.reviewModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.reviewModel.countDocuments(query),
    ]);
    return { data: data.map((r) => ReviewMapper.toDomain(r)), total };
  }

  async findManyByProductId(
    productId: string,
    status: string,
    page: number,
    limit: number,
  ): Promise<{ data: Review[]; total: number }> {
    if (!Types.ObjectId.isValid(productId)) return { data: [], total: 0 };
    const query = { productId: new Types.ObjectId(productId), status };
    const [data, total] = await Promise.all([
      this.reviewModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.reviewModel.countDocuments(query),
    ]);
    return { data: data.map((r) => ReviewMapper.toDomain(r)), total };
  }

  async findManyByVendorId(
    vendorId: string,
    status: string,
    page: number,
    limit: number,
  ): Promise<{ data: Review[]; total: number }> {
    if (!Types.ObjectId.isValid(vendorId)) return { data: [], total: 0 };
    const query = { vendorId: new Types.ObjectId(vendorId), status };
    const [data, total] = await Promise.all([
      this.reviewModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.reviewModel.countDocuments(query),
    ]);
    return { data: data.map((r) => ReviewMapper.toDomain(r)), total };
  }

  async findManyForAdmin(
    filters: AdminListReviewsFilters,
  ): Promise<{ data: Review[]; total: number }> {
    const query: QueryFilter<ReviewSchemaDocument> = {};
    if (filters.status) query.status = filters.status;
    if (filters.productId && Types.ObjectId.isValid(filters.productId))
      query.productId = new Types.ObjectId(filters.productId);
    if (filters.vendorId && Types.ObjectId.isValid(filters.vendorId))
      query.vendorId = new Types.ObjectId(filters.vendorId);

    const [data, total] = await Promise.all([
      this.reviewModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit),
      this.reviewModel.countDocuments(query),
    ]);
    return { data: data.map((r) => ReviewMapper.toDomain(r)), total };
  }

  async update(
    id: string,
    payload: DeepPartial<Review>,
  ): Promise<NullableType<Review>> {
    const updated = await this.reviewModel.findOneAndUpdate(
      { _id: id },
      ReviewMapper.toPersistence(payload as Partial<Review>),
      { new: true },
    );
    return updated ? ReviewMapper.toDomain(updated) : null;
  }

  async remove(id: string): Promise<void> {
    await this.reviewModel.deleteOne({ _id: id });
  }

  async aggregateByProductId(
    productId: string,
    status: string,
  ): Promise<RatingSummary> {
    if (!Types.ObjectId.isValid(productId))
      return { average: 0, count: 0, breakdown: emptyBreakdown() };
    const rows = await this.reviewModel.aggregate<{
      _id: number;
      count: number;
    }>([
      { $match: { productId: new Types.ObjectId(productId), status } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    return buildSummary(rows);
  }

  async aggregateByVendorId(
    vendorId: string,
    status: string,
  ): Promise<RatingSummary> {
    if (!Types.ObjectId.isValid(vendorId))
      return { average: 0, count: 0, breakdown: emptyBreakdown() };
    const rows = await this.reviewModel.aggregate<{
      _id: number;
      count: number;
    }>([
      { $match: { vendorId: new Types.ObjectId(vendorId), status } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    return buildSummary(rows);
  }
}

function emptyBreakdown(): Record<string, number> {
  return { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
}

function buildSummary(rows: { _id: number; count: number }[]): RatingSummary {
  const breakdown = emptyBreakdown();
  let weightedSum = 0;
  let count = 0;
  for (const row of rows) {
    const key = String(row._id);
    if (key in breakdown) breakdown[key] = row.count;
    weightedSum += row._id * row.count;
    count += row.count;
  }
  return {
    average: count > 0 ? Math.round((weightedSum / count) * 10) / 10 : 0,
    count,
    breakdown,
  };
}
