import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { Role } from '../../../../../common/constants/auth.constants';
import type { UserStatus } from '../../../../../common/constants/auth.constants';
import { User } from '../../../../domain/user';
import {
  FcmTokenInput,
  ListUsersFilters,
  UserRepository,
} from '../../user.repository';
import { UserSchemaClass, UserSchemaDocument } from '../entities/user.schema';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UsersDocumentRepository implements UserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserSchemaDocument>,
  ) {}

  async create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    const created = await this.userModel.create(UserMapper.toPersistence(data));
    return UserMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<User>> {
    const found = await this.userModel.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });
    return found ? UserMapper.toDomain(found) : null;
  }

  async findByPhone(phone: string): Promise<NullableType<User>> {
    const found = await this.userModel.findOne({
      phone,
      deletedAt: { $exists: false },
    });
    return found ? UserMapper.toDomain(found) : null;
  }

  async findByIdentifierWithPassword(
    identifier: string,
  ): Promise<NullableType<User>> {
    const found = await this.userModel
      .findOne({
        $or: [{ phone: identifier }, { email: identifier }],
        deletedAt: { $exists: false },
      })
      .select('+passwordHash');
    return found ? UserMapper.toDomain(found) : null;
  }

  async findByEmail(email: string): Promise<NullableType<User>> {
    const found = await this.userModel.findOne({
      email,
      deletedAt: { $exists: false },
    });
    return found ? UserMapper.toDomain(found) : null;
  }

  async update(
    id: string,
    payload: DeepPartial<User>,
  ): Promise<NullableType<User>> {
    const updated = await this.userModel.findOneAndUpdate(
      { _id: id },
      UserMapper.toPersistence(payload as Partial<User>),
      { new: true },
    );
    return updated ? UserMapper.toDomain(updated) : null;
  }

  async pushFcmToken(id: string, input: FcmTokenInput): Promise<void> {
    const now = new Date();
    // Deduplicate: drop any existing token for the same device before pushing the new one.
    await this.userModel.updateOne(
      { _id: id },
      { $pull: { fcmTokens: { device: input.device } } },
    );
    await this.userModel.updateOne(
      { _id: id },
      {
        $push: {
          fcmTokens: {
            token: input.fcmToken,
            device: input.device,
            addedAt: now,
            lastUsedAt: now,
          },
        },
      },
    );
  }

  async pullFcmTokenById(id: string, tokenId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: id },
      { $pull: { fcmTokens: { _id: tokenId } } },
    );
  }

  async pullFcmTokenByToken(id: string, token: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: id },
      { $pull: { fcmTokens: { token } } },
    );
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) return;
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedAt: new Date(),
        status: 'deleted',
        email: user.email ? `deleted_${id}@lokal.invalid` : user.email,
        phone: `deleted_${id}_${user.phone}`,
        fcmTokens: [],
      },
    );
  }

  async remove(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: id });
  }

  async findManyWithPagination(
    filters: ListUsersFilters,
  ): Promise<{ data: User[]; total: number }> {
    const query: QueryFilter<UserSchemaDocument> = {
      deletedAt: { $exists: false },
    };
    if (filters.role) query.role = filters.role as Role;
    if (filters.status) query.status = filters.status as UserStatus;
    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit),
      this.userModel.countDocuments(query),
    ]);

    return { data: data.map((u) => UserMapper.toDomain(u)), total };
  }

  async findManyByIds(ids: string[]): Promise<User[]> {
    const found = await this.userModel.find({ _id: { $in: ids } });
    return found.map((u) => UserMapper.toDomain(u));
  }

  async countByRole(role: Role): Promise<number> {
    return this.userModel.countDocuments({
      role,
      deletedAt: { $exists: false },
    });
  }

  async countActive(): Promise<number> {
    return this.userModel.countDocuments({
      status: 'active',
      deletedAt: { $exists: false },
    });
  }

  async countRegisteredSince(since: Date): Promise<number> {
    return this.userModel.countDocuments({ createdAt: { $gte: since } });
  }

  async countAll(): Promise<number> {
    return this.userModel.countDocuments({});
  }
}
