import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import type { VendorStatus } from '../../../../../common/constants/auth.constants';
import { Vendor } from '../../../../domain/vendor';
import { ListVendorsFilters, VendorRepository } from '../../vendor.repository';
import {
  VendorSchemaClass,
  VendorSchemaDocument,
} from '../entities/vendor.schema';
import { VendorMapper } from '../mappers/vendor.mapper';

@Injectable()
export class VendorsDocumentRepository implements VendorRepository {
  constructor(
    @InjectModel(VendorSchemaClass.name)
    private readonly vendorModel: Model<VendorSchemaDocument>,
  ) {}

  async create(
    data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Vendor> {
    const created = await this.vendorModel.create(
      VendorMapper.toPersistence(data),
    );
    return VendorMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<Vendor>> {
    if (!Types.ObjectId.isValid(id)) return null;
    const found = await this.vendorModel.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });
    return found ? VendorMapper.toDomain(found) : null;
  }

  async findByUserId(userId: string): Promise<NullableType<Vendor>> {
    const found = await this.vendorModel.findOne({
      userId: new Types.ObjectId(userId),
      deletedAt: { $exists: false },
    });
    return found ? VendorMapper.toDomain(found) : null;
  }

  async findByStoreName(storeName: string): Promise<NullableType<Vendor>> {
    const found = await this.vendorModel.findOne({ storeName });
    return found ? VendorMapper.toDomain(found) : null;
  }

  async findManyByUserIds(userIds: string[]): Promise<Vendor[]> {
    const found = await this.vendorModel.find({
      userId: { $in: userIds.map((id) => new Types.ObjectId(id)) },
      deletedAt: { $exists: false },
    });
    return found.map((v) => VendorMapper.toDomain(v));
  }

  async update(
    id: string,
    payload: DeepPartial<Vendor>,
  ): Promise<NullableType<Vendor>> {
    const updated = await this.vendorModel.findOneAndUpdate(
      { _id: id },
      VendorMapper.toPersistence(payload as Partial<Vendor>),
      { new: true },
    );
    return updated ? VendorMapper.toDomain(updated) : null;
  }

  async updateByUserId(
    userId: string,
    payload: DeepPartial<Vendor>,
  ): Promise<NullableType<Vendor>> {
    const updated = await this.vendorModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      VendorMapper.toPersistence(payload as Partial<Vendor>),
      { new: true },
    );
    return updated ? VendorMapper.toDomain(updated) : null;
  }

  async remove(id: string): Promise<void> {
    await this.vendorModel.deleteOne({ _id: id });
  }

  async findManyWithPagination(
    filters: ListVendorsFilters,
  ): Promise<{ data: Vendor[]; total: number }> {
    const query: QueryFilter<VendorSchemaDocument> = {
      deletedAt: { $exists: false },
    };
    if (filters.status) query.status = filters.status as VendorStatus;
    if (filters.search)
      query.storeName = { $regex: filters.search, $options: 'i' };

    const [data, total] = await Promise.all([
      this.vendorModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit),
      this.vendorModel.countDocuments(query),
    ]);

    return { data: data.map((v) => VendorMapper.toDomain(v)), total };
  }

  async countByStatus(status: VendorStatus): Promise<number> {
    return this.vendorModel.countDocuments({
      status,
      deletedAt: { $exists: false },
    });
  }

  async countCreatedSince(since: Date): Promise<number> {
    return this.vendorModel.countDocuments({ createdAt: { $gte: since } });
  }

  async countAll(): Promise<number> {
    return this.vendorModel.countDocuments({});
  }
}
