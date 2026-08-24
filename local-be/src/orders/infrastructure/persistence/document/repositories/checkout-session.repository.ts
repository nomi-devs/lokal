import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { CheckoutSession } from '../../../../domain/checkout-session';
import { CheckoutSessionRepository } from '../../checkout-session.repository';
import {
  CheckoutSessionSchemaClass,
  CheckoutSessionSchemaDocument,
} from '../entities/checkout-session.schema';
import { CheckoutSessionMapper } from '../mappers/checkout-session.mapper';

@Injectable()
export class CheckoutSessionDocumentRepository implements CheckoutSessionRepository {
  constructor(
    @InjectModel(CheckoutSessionSchemaClass.name)
    private readonly checkoutSessionModel: Model<CheckoutSessionSchemaDocument>,
  ) {}

  async create(
    data: Omit<CheckoutSession, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CheckoutSession> {
    const created = await this.checkoutSessionModel.create(
      CheckoutSessionMapper.toPersistence(data),
    );
    return CheckoutSessionMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<CheckoutSession>> {
    if (!Types.ObjectId.isValid(id)) return null;
    const found = await this.checkoutSessionModel.findById(id);
    return found ? CheckoutSessionMapper.toDomain(found) : null;
  }

  async findByInvoiceId(
    invoiceId: string,
  ): Promise<NullableType<CheckoutSession>> {
    const found = await this.checkoutSessionModel.findOne({
      myFatoorahInvoiceId: invoiceId,
    });
    return found ? CheckoutSessionMapper.toDomain(found) : null;
  }

  async update(
    id: string,
    payload: DeepPartial<CheckoutSession>,
  ): Promise<NullableType<CheckoutSession>> {
    const updated = await this.checkoutSessionModel.findByIdAndUpdate(
      id,
      CheckoutSessionMapper.updateToPersistence(
        payload as Partial<CheckoutSession>,
      ),
      { new: true },
    );
    return updated ? CheckoutSessionMapper.toDomain(updated) : null;
  }

  async claimPendingForFinalization(
    id: string,
  ): Promise<NullableType<CheckoutSession>> {
    if (!Types.ObjectId.isValid(id)) return null;
    // { new: false } (the default, made explicit here) returns the
    // pre-update document — only present when the filter actually matched,
    // i.e. only when this call is the one flipping pending -> paid.
    const claimed = await this.checkoutSessionModel.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { status: 'paid' },
      { new: false },
    );
    return claimed ? CheckoutSessionMapper.toDomain(claimed) : null;
  }
}
