import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Cart, CartItem } from '../../../../domain/cart';
import { CartRepository } from '../../cart.repository';
import { CartSchemaClass, CartSchemaDocument } from '../entities/cart.schema';
import { CartMapper } from '../mappers/cart.mapper';

@Injectable()
export class CartDocumentRepository implements CartRepository {
  constructor(
    @InjectModel(CartSchemaClass.name)
    private readonly cartModel: Model<CartSchemaDocument>,
  ) {}

  async findByUserId(userId: string): Promise<NullableType<Cart>> {
    const found = await this.cartModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    return found ? CartMapper.toDomain(found) : null;
  }

  async createEmpty(userId: string): Promise<Cart> {
    const created = await this.cartModel.create({
      userId: new Types.ObjectId(userId),
      items: [],
    });
    return CartMapper.toDomain(created);
  }

  async replaceItems(
    userId: string,
    items: CartItem[],
  ): Promise<NullableType<Cart>> {
    const updated = await this.cartModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          items: items.map((item) => CartMapper.itemToPersistence(item)),
        },
      },
      { new: true },
    );
    return updated ? CartMapper.toDomain(updated) : null;
  }
}
