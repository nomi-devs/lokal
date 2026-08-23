import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/domain/product';
import { Wishlist } from './domain/wishlist';
import { WishlistRepository } from './infrastructure/persistence/wishlist.repository';

export interface WishlistWithProduct extends Wishlist {
  product: Product | null;
}

@Injectable()
export class WishlistsService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productsService: ProductsService,
  ) {}

  async findManyByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: WishlistWithProduct[]; total: number }> {
    const { data, total } = await this.wishlistRepository.findManyByUserId(
      userId,
      page,
      limit,
    );

    const products = await this.productsService.findManyByIds(
      data.map((w) => w.productId),
    );
    const productById = new Map(products.map((p) => [p.id, p]));

    return {
      data: data.map((w) =>
        Object.assign(new Wishlist(), w, {
          product: productById.get(w.productId) ?? null,
        }),
      ),
      total,
    };
  }

  countByUserId(userId: string): Promise<number> {
    return this.wishlistRepository.countByUserId(userId);
  }
}
