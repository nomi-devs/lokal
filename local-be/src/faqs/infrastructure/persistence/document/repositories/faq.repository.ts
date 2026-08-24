import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { Faq } from '../../../../domain/faq';
import { FaqRepository } from '../../faq.repository';
import { FaqSchemaClass, FaqSchemaDocument } from '../entities/faq.schema';
import { FaqMapper } from '../mappers/faq.mapper';

@Injectable()
export class FaqsDocumentRepository implements FaqRepository {
  constructor(
    @InjectModel(FaqSchemaClass.name)
    private readonly faqModel: Model<FaqSchemaDocument>,
  ) {}

  async create(
    data: Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Faq> {
    const created = await this.faqModel.create(FaqMapper.toPersistence(data));
    return FaqMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<Faq>> {
    const found = await this.faqModel.findOne({ _id: id });
    return found ? FaqMapper.toDomain(found) : null;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Faq[]; total: number }> {
    const [found, total] = await Promise.all([
      this.faqModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.faqModel.countDocuments(),
    ]);
    return { data: found.map((f) => FaqMapper.toDomain(f)), total };
  }

  async findActive(): Promise<Faq[]> {
    const found = await this.faqModel
      .find({ isActive: true })
      .sort({ sortOrder: 1 });
    return found.map((f) => FaqMapper.toDomain(f));
  }

  async update(
    id: string,
    payload: DeepPartial<Faq>,
  ): Promise<NullableType<Faq>> {
    const updated = await this.faqModel.findOneAndUpdate(
      { _id: id },
      FaqMapper.toPersistence(payload as Partial<Faq>),
      { new: true },
    );
    return updated ? FaqMapper.toDomain(updated) : null;
  }

  async remove(id: string): Promise<void> {
    await this.faqModel.deleteOne({ _id: id });
  }
}
