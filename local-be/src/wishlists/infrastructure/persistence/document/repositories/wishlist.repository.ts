import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Wishlist } from '../../../../domain/wishlist';
import { WishlistRepository } from '../../wishlist.repository';
import {
  WishlistSchemaClass,
  WishlistSchemaDocument,
} from '../entities/wishlist.schema';
import { WishlistMapper } from '../mappers/wishlist.mapper';

@Injectable()
export class WishlistsDocumentRepository implements WishlistRepository {
  constructor(
    @InjectModel(WishlistSchemaClass.name)
    private readonly wishlistModel: Model<WishlistSchemaDocument>,
  ) {}

  async create(data: { userId: string; productId: string }): Promise<Wishlist> {
    const created = await this.wishlistModel.create({
      userId: new Types.ObjectId(data.userId),
      productId: new Types.ObjectId(data.productId),
    });
    return WishlistMapper.toDomain(created);
  }

  async findManyByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Wishlist[]; total: number }> {
    const query = { userId: new Types.ObjectId(userId) };

    const [data, total] = await Promise.all([
      this.wishlistModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.wishlistModel.countDocuments(query),
    ]);

    return { data: data.map((w) => WishlistMapper.toDomain(w)), total };
  }

  async findOneByUserAndProduct(
    userId: string,
    productId: string,
  ): Promise<NullableType<Wishlist>> {
    if (!Types.ObjectId.isValid(productId)) return null;
    const found = await this.wishlistModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
    });
    return found ? WishlistMapper.toDomain(found) : null;
  }

  async findWishlistedProductIds(
    userId: string,
    productIds: string[],
  ): Promise<string[]> {
    const validIds = productIds.filter((id) => Types.ObjectId.isValid(id));
    if (validIds.length === 0) return [];

    const found = await this.wishlistModel
      .find({
        userId: new Types.ObjectId(userId),
        productId: { $in: validIds.map((id) => new Types.ObjectId(id)) },
      })
      .select('productId');
    return found.map((w) => String(w.productId));
  }

  async remove(id: string): Promise<void> {
    await this.wishlistModel.deleteOne({ _id: id });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.wishlistModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });
  }
}
