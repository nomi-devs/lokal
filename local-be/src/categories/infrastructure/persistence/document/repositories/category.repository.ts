import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { Category } from '../../../../domain/category';
import { CategoryRepository } from '../../category.repository';
import {
  CategorySchemaClass,
  CategorySchemaDocument,
} from '../entities/category.schema';
import { CategoryMapper } from '../mappers/category.mapper';

@Injectable()
export class CategoriesDocumentRepository implements CategoryRepository {
  constructor(
    @InjectModel(CategorySchemaClass.name)
    private readonly categoryModel: Model<CategorySchemaDocument>,
  ) {}

  async create(
    data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Category> {
    const created = await this.categoryModel.create(
      CategoryMapper.toPersistence(data),
    );
    return CategoryMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<Category>> {
    const found = await this.categoryModel.findOne({ _id: id });
    return found ? CategoryMapper.toDomain(found) : null;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Category[]; total: number }> {
    const [found, total] = await Promise.all([
      this.categoryModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.categoryModel.countDocuments(),
    ]);
    return { data: found.map((c) => CategoryMapper.toDomain(c)), total };
  }

  async findActive(
    page: number,
    limit: number,
  ): Promise<{ data: Category[]; total: number }> {
    const query = { isActive: true };
    const [found, total] = await Promise.all([
      this.categoryModel
        .find(query)
        .sort({ nameEn: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.categoryModel.countDocuments(query),
    ]);
    return { data: found.map((c) => CategoryMapper.toDomain(c)), total };
  }

  async update(
    id: string,
    payload: DeepPartial<Category>,
  ): Promise<NullableType<Category>> {
    const updated = await this.categoryModel.findOneAndUpdate(
      { _id: id },
      CategoryMapper.toPersistence(payload as Partial<Category>),
      { new: true },
    );
    return updated ? CategoryMapper.toDomain(updated) : null;
  }

  async remove(id: string): Promise<void> {
    await this.categoryModel.deleteOne({ _id: id });
  }
}
