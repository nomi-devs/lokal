import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { Address } from '../../../../domain/address';
import { AddressRepository } from '../../address.repository';
import {
  AddressSchemaClass,
  AddressSchemaDocument,
} from '../entities/address.schema';
import { AddressMapper } from '../mappers/address.mapper';

@Injectable()
export class AddressesDocumentRepository implements AddressRepository {
  constructor(
    @InjectModel(AddressSchemaClass.name)
    private readonly addressModel: Model<AddressSchemaDocument>,
  ) {}

  async create(
    data: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Address> {
    const created = await this.addressModel.create(
      AddressMapper.toPersistence(data),
    );
    return AddressMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<Address>> {
    if (!Types.ObjectId.isValid(id)) return null;
    const found = await this.addressModel.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });
    return found ? AddressMapper.toDomain(found) : null;
  }

  async findManyByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Address[]; total: number }> {
    const query = {
      userId: new Types.ObjectId(userId),
      deletedAt: { $exists: false },
    };

    const [data, total] = await Promise.all([
      this.addressModel
        .find(query)
        .sort({ isPrimary: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.addressModel.countDocuments(query),
    ]);

    return { data: data.map((a) => AddressMapper.toDomain(a)), total };
  }

  async update(
    id: string,
    payload: DeepPartial<Address>,
  ): Promise<NullableType<Address>> {
    const updated = await this.addressModel.findOneAndUpdate(
      { _id: id },
      AddressMapper.toPersistence(payload as Partial<Address>),
      { new: true },
    );
    return updated ? AddressMapper.toDomain(updated) : null;
  }

  async remove(id: string): Promise<void> {
    await this.addressModel.updateOne({ _id: id }, { deletedAt: new Date() });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.addressModel.countDocuments({
      userId: new Types.ObjectId(userId),
      deletedAt: { $exists: false },
    });
  }

  async unsetPrimaryForUser(userId: string, exceptId?: string): Promise<void> {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      isPrimary: true,
    };
    if (exceptId) query._id = { $ne: exceptId };
    await this.addressModel.updateMany(query, { isPrimary: false });
  }
}
