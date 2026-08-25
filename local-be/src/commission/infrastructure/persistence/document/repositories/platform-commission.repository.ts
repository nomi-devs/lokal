import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { PlatformCommission } from '../../../../domain/platform-commission';
import { PlatformCommissionRepository } from '../../platform-commission.repository';
import {
  PlatformCommissionSchemaClass,
  PlatformCommissionSchemaDocument,
} from '../entities/platform-commission.schema';
import { PlatformCommissionMapper } from '../mappers/platform-commission.mapper';

const SINGLETON_ID = 'global';

@Injectable()
export class PlatformCommissionDocumentRepository implements PlatformCommissionRepository {
  constructor(
    @InjectModel(PlatformCommissionSchemaClass.name)
    private readonly commissionModel: Model<PlatformCommissionSchemaDocument>,
  ) {}

  async get(): Promise<NullableType<PlatformCommission>> {
    const found = await this.commissionModel.findOne({ _id: SINGLETON_ID });
    return found ? PlatformCommissionMapper.toDomain(found) : null;
  }

  async set(
    percentage: number,
    updatedBy: string,
  ): Promise<PlatformCommission> {
    const updated = await this.commissionModel.findOneAndUpdate(
      { _id: SINGLETON_ID },
      { percentage, updatedBy: new Types.ObjectId(updatedBy) },
      { new: true, upsert: true },
    );
    return PlatformCommissionMapper.toDomain(updated);
  }
}
