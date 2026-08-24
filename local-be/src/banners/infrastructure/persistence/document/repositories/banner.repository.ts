import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { Banner } from '../../../../domain/banner';
import { BannerRepository } from '../../banner.repository';
import {
  BannerSchemaClass,
  BannerSchemaDocument,
} from '../entities/banner.schema';
import { BannerMapper } from '../mappers/banner.mapper';

@Injectable()
export class BannersDocumentRepository implements BannerRepository {
  constructor(
    @InjectModel(BannerSchemaClass.name)
    private readonly bannerModel: Model<BannerSchemaDocument>,
  ) {}

  async create(
    data: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Banner> {
    const created = await this.bannerModel.create(
      BannerMapper.toPersistence(data),
    );
    return BannerMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<Banner>> {
    const found = await this.bannerModel.findOne({ _id: id });
    return found ? BannerMapper.toDomain(found) : null;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Banner[]; total: number }> {
    const [found, total] = await Promise.all([
      this.bannerModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.bannerModel.countDocuments(),
    ]);
    return { data: found.map((b) => BannerMapper.toDomain(b)), total };
  }

  async findActive(): Promise<Banner[]> {
    const now = new Date();
    const found = await this.bannerModel
      .find({
        isActive: true,
        $and: [
          {
            $or: [
              { startDate: { $exists: false } },
              { startDate: { $lte: now } },
            ],
          },
          {
            $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }],
          },
        ],
      })
      .sort({ sortOrder: 1 });
    return found.map((b) => BannerMapper.toDomain(b));
  }

  async update(
    id: string,
    payload: DeepPartial<Banner>,
  ): Promise<NullableType<Banner>> {
    const updated = await this.bannerModel.findOneAndUpdate(
      { _id: id },
      BannerMapper.toPersistence(payload as Partial<Banner>),
      { new: true },
    );
    return updated ? BannerMapper.toDomain(updated) : null;
  }

  async remove(id: string): Promise<void> {
    await this.bannerModel.deleteOne({ _id: id });
  }
}
