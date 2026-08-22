import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import {
  RefreshToken,
  RefreshTokenDeviceInfo,
} from '../../../../domain/refresh-token';
import { RefreshTokenRepository } from '../../refresh-token.repository';
import {
  RefreshTokenSchemaClass,
  RefreshTokenSchemaDocument,
} from '../entities/refresh-token.schema';
import { RefreshTokenMapper } from '../mappers/refresh-token.mapper';

@Injectable()
export class RefreshTokensDocumentRepository implements RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshTokenSchemaClass.name)
    private readonly refreshTokenModel: Model<RefreshTokenSchemaDocument>,
  ) {}

  async create(data: {
    userId: string;
    tokenHash: string;
    deviceInfo: RefreshTokenDeviceInfo;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    const created = await this.refreshTokenModel.create({
      userId: new Types.ObjectId(data.userId),
      tokenHash: data.tokenHash,
      deviceInfo: data.deviceInfo,
      expiresAt: data.expiresAt,
    });
    return RefreshTokenMapper.toDomain(created);
  }

  async findValidByTokenHash(
    tokenHash: string,
  ): Promise<NullableType<RefreshToken>> {
    const found = await this.refreshTokenModel.findOne({
      tokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
    return found ? RefreshTokenMapper.toDomain(found) : null;
  }

  async findActiveByUser(userId: string): Promise<RefreshToken[]> {
    const found = await this.refreshTokenModel
      .find({
        userId: new Types.ObjectId(userId),
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: 1 });
    return found.map((r) => RefreshTokenMapper.toDomain(r));
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.refreshTokenModel.updateOne({ tokenHash }, { isRevoked: true });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { userId: new Types.ObjectId(userId), isRevoked: false },
      { isRevoked: true },
    );
  }

  async revokeMany(ids: string[]): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { _id: { $in: ids } },
      { isRevoked: true },
    );
  }
}
