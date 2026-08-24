import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { ProductsService } from '../products/products.service';
import { VendorsService } from '../vendors/vendors.service';
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
    private readonly vendorsService: VendorsService,
  ) {}

  // Admin-facing — every entry, including ones whose product is no longer
  // public (an admin reviewing a customer's history wants the full picture).
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
    return { data: await this.attachProducts(data), total };
  }

  // Customer-facing (GET /me/wishlist) — hides entries whose product is no
  // longer public (inactive/rejected, or its vendor is no longer active),
  // per the business rule. Filtered after pagination, so a page can come
  // back with fewer than `limit` items when some entries are hidden.
  async findManyPublicByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: WishlistWithProduct[]; total: number }> {
    const { data, total } = await this.wishlistRepository.findManyByUserId(
      userId,
      page,
      limit,
    );
    const withProducts = await this.attachProducts(data);
    const activeVendorIds = new Set(
      await this.vendorsService.findActiveVendorIds(),
    );

    return {
      data: withProducts.filter(
        (w) =>
          w.product !== null &&
          w.product.status === 'active' &&
          activeVendorIds.has(w.product.vendorId),
      ),
      total,
    };
  }

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    const product = await this.productsService.findById(productId);
    if (!product) {
      throw new AppException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        'Product not found',
        404,
      );
    }

    const existing = await this.wishlistRepository.findOneByUserAndProduct(
      userId,
      productId,
    );
    if (existing) {
      throw new AppException(
        ERROR_CODES.WISHLIST_ITEM_EXISTS,
        'Product already in wishlist',
        409,
      );
    }

    return this.wishlistRepository.create({ userId, productId });
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const existing = await this.wishlistRepository.findOneByUserAndProduct(
      userId,
      productId,
    );
    if (!existing) {
      throw new AppException(
        ERROR_CODES.WISHLIST_ITEM_NOT_FOUND,
        'Wishlist item not found',
        404,
      );
    }
    await this.wishlistRepository.remove(existing.id);
  }

  countByUserId(userId: string): Promise<number> {
    return this.wishlistRepository.countByUserId(userId);
  }

  private async attachProducts(
    entries: Wishlist[],
  ): Promise<WishlistWithProduct[]> {
    const products = await this.productsService.findManyByIds(
      entries.map((w) => w.productId),
    );
    const productById = new Map(products.map((p) => [p.id, p]));

    return entries.map((w) =>
      Object.assign(new Wishlist(), w, {
        product: productById.get(w.productId) ?? null,
      }),
    );
  }
}
