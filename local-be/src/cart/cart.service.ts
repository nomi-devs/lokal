import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/domain/product';
import { Cart } from './domain/cart';
import { CartRepository } from './infrastructure/persistence/cart.repository';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async getForUser(userId: string): Promise<Cart> {
    const cart = await this.getOrCreate(userId);
    return this.withTotals(cart);
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<Cart> {
    const product = await this.assertPurchasable(dto.productId);
    const cart = await this.getOrCreate(userId);

    const items = [...cart.items];
    const existingIndex = items.findIndex(
      (item) =>
        item.productId === dto.productId &&
        item.size === dto.size &&
        item.color === dto.color,
    );

    if (existingIndex >= 0) {
      items[existingIndex] = {
        ...items[existingIndex],
        qty: items[existingIndex].qty + dto.qty,
        unitPrice: product.price,
      };
    } else {
      items.push({
        id: '',
        productId: dto.productId,
        storeId: product.vendorId,
        size: dto.size,
        color: dto.color,
        qty: dto.qty,
        unitPrice: product.price,
      });
    }

    const updated = await this.cartRepository.replaceItems(userId, items);
    return this.withTotals(updated as Cart);
  }

  async updateItemQty(
    userId: string,
    itemId: string,
    qty: number,
  ): Promise<Cart> {
    const cart = await this.getOrCreate(userId);
    const index = cart.items.findIndex((item) => item.id === itemId);
    if (index < 0) {
      throw new AppException(
        ERROR_CODES.CART_ITEM_NOT_FOUND,
        'Cart item not found',
        404,
      );
    }

    const items = [...cart.items];
    items[index] = { ...items[index], qty };

    const updated = await this.cartRepository.replaceItems(userId, items);
    return this.withTotals(updated as Cart);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreate(userId);
    const items = cart.items.filter((item) => item.id !== itemId);
    if (items.length === cart.items.length) {
      throw new AppException(
        ERROR_CODES.CART_ITEM_NOT_FOUND,
        'Cart item not found',
        404,
      );
    }

    const updated = await this.cartRepository.replaceItems(userId, items);
    return this.withTotals(updated as Cart);
  }

  // Removes exactly the given items (e.g. the ones just purchased at
  // checkout), leaving anything else the customer has added since —
  // idempotent: a re-delivered payment webhook calling this twice is a
  // no-op the second time (see OrdersService.finalizeCheckout).
  async removeItems(userId: string, itemIds: string[]): Promise<void> {
    if (itemIds.length === 0) return;
    const cart = await this.getOrCreate(userId);
    const idSet = new Set(itemIds);
    const items = cart.items.filter((item) => !idSet.has(item.id));
    if (items.length === cart.items.length) return;
    await this.cartRepository.replaceItems(userId, items);
  }

  async clear(userId: string): Promise<Cart> {
    const cart = await this.getOrCreate(userId);
    const updated = await this.cartRepository.replaceItems(userId, []);
    return this.withTotals((updated as Cart) ?? cart);
  }

  private async getOrCreate(userId: string): Promise<Cart> {
    const existing = await this.cartRepository.findByUserId(userId);
    if (existing) return existing;
    return this.cartRepository.createEmpty(userId);
  }

  private async assertPurchasable(productId: string): Promise<Product> {
    const product = await this.productsService.findById(productId);
    if (!product || product.status !== 'active') {
      throw new AppException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        'Product not found',
        404,
      );
    }
    if (!product.inStock) {
      throw new AppException(
        ERROR_CODES.PRODUCT_NOT_AVAILABLE,
        'Product is out of stock',
        422,
      );
    }
    return product;
  }

  private withTotals(cart: Cart): Cart {
    const deliveryFee = this.configService.getOrThrow('cart.deliveryFee', {
      infer: true,
    });
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.qty,
      0,
    );
    return Object.assign(new Cart(), cart, {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
    });
  }
}
