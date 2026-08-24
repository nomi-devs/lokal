import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { PromoCode } from '../../../../domain/promo-code';
import {
  ListPromoCodesFilters,
  PromoCodeRepository,
} from '../../promo-code.repository';
import {
  PromoCodeSchemaClass,
  PromoCodeSchemaDocument,
} from '../entities/promo-code.schema';
import { PromoCodeMapper } from '../mappers/promo-code.mapper';

@Injectable()
export class PromoCodesDocumentRepository implements PromoCodeRepository {
  constructor(
    @InjectModel(PromoCodeSchemaClass.name)
    private readonly promoCodeModel: Model<PromoCodeSchemaDocument>,
  ) {}

  async create(
    data: Omit<
      PromoCode,
      'id' | 'createdAt' | 'updatedAt' | 'currentUsageCount'
    >,
  ): Promise<PromoCode> {
    const created = await this.promoCodeModel.create({
      ...PromoCodeMapper.toPersistence(data),
      currentUsageCount: 0,
    });
    return PromoCodeMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<PromoCode>> {
    const found = await this.promoCodeModel.findOne({ _id: id });
    return found ? PromoCodeMapper.toDomain(found) : null;
  }

  async findByCode(code: string): Promise<NullableType<PromoCode>> {
    const found = await this.promoCodeModel.findOne({
      code: code.toUpperCase(),
    });
    return found ? PromoCodeMapper.toDomain(found) : null;
  }

  async findManyWithPagination(
    filters: ListPromoCodesFilters,
  ): Promise<{ data: PromoCode[]; total: number }> {
    const query: QueryFilter<PromoCodeSchemaDocument> = {};
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.search) {
      query.code = { $regex: filters.search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.promoCodeModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit),
      this.promoCodeModel.countDocuments(query),
    ]);
    return { data: data.map((p) => PromoCodeMapper.toDomain(p)), total };
  }

  async update(
    id: string,
    payload: DeepPartial<PromoCode>,
  ): Promise<NullableType<PromoCode>> {
    const updated = await this.promoCodeModel.findOneAndUpdate(
      { _id: id },
      PromoCodeMapper.toPersistence(payload as Partial<PromoCode>),
      { new: true },
    );
    return updated ? PromoCodeMapper.toDomain(updated) : null;
  }

  async remove(id: string): Promise<void> {
    await this.promoCodeModel.deleteOne({ _id: id });
  }
}
