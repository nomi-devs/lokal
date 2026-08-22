import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Otp } from '../../../../domain/otp';
import { OtpRepository } from '../../otp.repository';
import { OtpSchemaClass, OtpSchemaDocument } from '../entities/otp.schema';
import { OtpMapper } from '../mappers/otp.mapper';

@Injectable()
export class OtpDocumentRepository implements OtpRepository {
  constructor(
    @InjectModel(OtpSchemaClass.name)
    private readonly otpModel: Model<OtpSchemaDocument>,
  ) {}

  async create(data: {
    phone: string;
    otpHash: string;
    expiresAt: Date;
  }): Promise<Otp> {
    const created = await this.otpModel.create(data);
    return OtpMapper.toDomain(created);
  }

  async findLatestByPhone(phone: string): Promise<NullableType<Otp>> {
    const found = await this.otpModel
      .findOne({ phone })
      .sort({ createdAt: -1 })
      .select('+otpHash');
    return found ? OtpMapper.toDomain(found) : null;
  }

  async countCreatedSince(phone: string, since: Date): Promise<number> {
    return this.otpModel.countDocuments({ phone, createdAt: { $gte: since } });
  }

  async markUsed(id: string): Promise<void> {
    await this.otpModel.updateOne({ _id: id }, { isUsed: true });
  }

  async incrementAttempts(id: string): Promise<number> {
    const updated = await this.otpModel.findOneAndUpdate(
      { _id: id },
      { $inc: { attempts: 1 } },
      { new: true },
    );
    return updated?.attempts ?? 0;
  }
}
