import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { Product } from '../../../../domain/product';
import { ProductRepository } from '../../product.repository';
import {
  ProductSchemaClass,
  ProductSchemaDocument,
} from '../entities/product.schema';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductsDocumentRepository implements ProductRepository {
  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: Model<ProductSchemaDocument>,
  ) {}

  async create(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    const created = await this.productModel.create(
      ProductMapper.toPersistence(data),
    );
    return ProductMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<Product>> {
    if (!Types.ObjectId.isValid(id)) return null;
    const found = await this.productModel.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });
    return found ? ProductMapper.toDomain(found) : null;
  }

  async findManyByIds(ids: string[]): Promise<Product[]> {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    const found = await this.productModel.find({
      _id: { $in: validIds },
      deletedAt: { $exists: false },
    });
    return found.map((p) => ProductMapper.toDomain(p));
  }

  async findManyByVendorId(
    vendorId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Product[]; total: number }> {
    const query = {
      vendorId: new Types.ObjectId(vendorId),
      deletedAt: { $exists: false },
    };

    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.productModel.countDocuments(query),
    ]);

    return { data: data.map((p) => ProductMapper.toDomain(p)), total };
  }

  async update(
    id: string,
    payload: DeepPartial<Product>,
  ): Promise<NullableType<Product>> {
    const updated = await this.productModel.findOneAndUpdate(
      { _id: id },
      ProductMapper.toPersistence(payload as Partial<Product>),
      { new: true },
    );
    return updated ? ProductMapper.toDomain(updated) : null;
  }

  async remove(id: string): Promise<void> {
    await this.productModel.updateOne({ _id: id }, { deletedAt: new Date() });
  }

  async countByVendorId(vendorId: string): Promise<number> {
    return this.productModel.countDocuments({
      vendorId: new Types.ObjectId(vendorId),
      deletedAt: { $exists: false },
    });
  }
}
