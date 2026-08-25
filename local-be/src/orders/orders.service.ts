import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { CartService } from '../cart/cart.service';
import { AddressesService } from '../addresses/addresses.service';
import { ProductsService } from '../products/products.service';
import { VendorsService } from '../vendors/vendors.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CommissionService } from '../commission/commission.service';
import { Order } from './domain/order';
import { CheckoutOrderDraft } from './domain/checkout-session';
import { OrderRepository } from './infrastructure/persistence/order.repository';
import { CheckoutSessionRepository } from './infrastructure/persistence/checkout-session.repository';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import {
  CANCELLABLE_STATUSES,
  OrderStatus,
  TAB_STATUSES,
  VENDOR_ALLOWED_TRANSITIONS,
} from './orders.constants';

export interface CheckoutResult {
  checkoutSessionId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
}

export interface OrderInvoice extends Order {
  storeName: string;
  customerName: string;
  customerEmail?: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly checkoutSessionRepository: CheckoutSessionRepository,
    private readonly cartService: CartService,
    private readonly addressesService: AddressesService,
    private readonly productsService: ProductsService,
    private readonly vendorsService: VendorsService,
    private readonly usersService: UsersService,
    private readonly paymentsService: PaymentsService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly commissionService: CommissionService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  // Builds the per-vendor snapshot from the live cart/products/address,
  // charges it through MyFatoorah, and only THEN persists a CheckoutSession
  // — no Order exists yet. Orders are created later, exclusively by
  // finalizeCheckout once MyFatoorah confirms payment; if the customer
  // never completes payment (or it fails), nothing here ever gets written
  // beyond this pending session, and the cart is never touched — see
  // finalizeCheckout for the other half of this flow.
  async checkout(userId: string, dto: CheckoutDto): Promise<CheckoutResult> {
    // Exactly one of paymentMethodId / sessionId — see CheckoutDto for why
    // this XOR can't be expressed with class-validator alone.
    if ((dto.paymentMethodId === undefined) === (dto.sessionId === undefined)) {
      throw new AppException(
        ERROR_CODES.VALIDATION_ERROR,
        'Provide exactly one of paymentMethodId or sessionId',
        422,
        [
          {
            field: 'paymentMethodId',
            message: 'Provide exactly one of paymentMethodId or sessionId',
          },
        ],
      );
    }

    const cart = await this.cartService.getForUser(userId);
    if (cart.items.length === 0) {
      throw new AppException(ERROR_CODES.CART_EMPTY, 'Cart is empty', 422);
    }

    const address = await this.addressesService.getOwnedByUserOrThrow(
      userId,
      dto.addressId,
    );

    const drafts = await this.buildOrderDrafts(cart.items);
    const totalAmount = drafts.reduce((sum, draft) => sum + draft.total, 0);

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new AppException(ERROR_CODES.USER_NOT_FOUND, 'User not found', 404);
    }

    const baseUrl = this.configService.getOrThrow('app.baseUrl', {
      infer: true,
    });
    const { invoiceId, paymentUrl } = await this.paymentsService.executePayment(
      {
        paymentMethodId: dto.paymentMethodId,
        sessionId: dto.sessionId,
        amount: totalAmount,
        customerName: `${user.firstName} ${user.lastName}`.trim(),
        customerEmail: user.email,
        customerMobile: user.phone,
        callBackUrl: `${baseUrl}/payments/myfatoorah/callback`,
        errorUrl: `${baseUrl}/payments/myfatoorah/error`,
        customerReference: userId,
      },
    );

    const session = await this.checkoutSessionRepository.create({
      userId,
      addressSnapshot: {
        label: address.label,
        name: address.name,
        country: address.country,
        city: address.city,
        phone: address.phone,
        addressLine: address.addressLine,
      },
      paymentMethodType:
        dto.paymentMethodId !== undefined
          ? String(dto.paymentMethodId)
          : 'saved-card',
      orders: drafts,
      totalAmount,
      cartItemIds: cart.items.map((item) => item.id),
      myFatoorahInvoiceId: invoiceId,
      status: 'pending',
    });

    return {
      checkoutSessionId: session.id,
      paymentUrl,
      amount: totalAmount,
      currency:
        this.configService.get('myfatoorah.currency', { infer: true }) ?? 'KWD',
    };
  }

  // Shared by both the /callback and /error MyFatoorah redirect routes —
  // never trust which URL the browser was sent to, always re-verify via
  // GetPaymentStatus (see PaymentsService.getPaymentStatus). Idempotent:
  // a redelivered/duplicate hit on an already-'paid' session just returns
  // the orders already created instead of creating them again.
  async finalizeCheckout(
    paymentId: string,
  ): Promise<{ success: boolean; orders: Order[] }> {
    const paymentStatus =
      await this.paymentsService.getPaymentStatus(paymentId);
    const session = await this.checkoutSessionRepository.findByInvoiceId(
      paymentStatus.invoiceId,
    );
    if (!session) {
      throw new AppException(
        ERROR_CODES.CHECKOUT_SESSION_NOT_FOUND,
        'Checkout session not found',
        404,
      );
    }

    if (session.status !== 'pending') {
      // Already resolved by an earlier call (paid -> orders exist; failed
      // -> none do) — report what already happened rather than redoing it.
      const orders = await this.orderRepository.findManyByCheckoutSessionId(
        session.id,
      );
      return { success: session.status === 'paid', orders };
    }

    if (!paymentStatus.isPaid) {
      await this.checkoutSessionRepository.update(session.id, {
        status: 'failed',
      });
      // Cart was never touched and no Order was ever created — the
      // customer's items are simply still sitting in their cart to retry.
      return { success: false, orders: [] };
    }

    // Claim the session before creating anything: if another concurrent
    // callback/error hit (e.g. a browser refresh) already claimed it
    // between the read above and here, back off and return its result
    // instead of creating a second set of orders for the same payment.
    const claimed =
      await this.checkoutSessionRepository.claimPendingForFinalization(
        session.id,
      );
    if (!claimed) {
      const orders = await this.orderRepository.findManyByCheckoutSessionId(
        session.id,
      );
      return { success: true, orders };
    }

    const now = new Date();
    const orders: Order[] = [];
    for (const draft of claimed.orders) {
      const order = await this.orderRepository.create({
        orderNumber: this.generateOrderNumber(),
        customerId: claimed.userId,
        storeId: draft.storeId,
        checkoutSessionId: claimed.id,
        items: draft.items,
        subtotal: draft.subtotal,
        deliveryFee: draft.deliveryFee,
        total: draft.total,
        commissionPercentSnapshot: draft.commissionPercentSnapshot,
        addressSnapshot: claimed.addressSnapshot,
        paymentMethodType: claimed.paymentMethodType,
        paymentStatus: 'paid',
        status: 'confirmed',
        statusHistory: [
          { status: 'placed', timestamp: claimed.createdAt },
          { status: 'confirmed', timestamp: now, note: 'Payment received' },
        ],
      });
      orders.push(order);
    }

    await this.cartService.removeItems(claimed.userId, claimed.cartItemIds);

    const user = await this.usersService.findById(claimed.userId);
    if (user?.email) {
      const orderNumbers = orders.map((o) => o.orderNumber).join(', ');
      void this.emailService.sendOrderConfirmation(
        user.email,
        orderNumbers,
        claimed.totalAmount,
      );
    }

    void this.notifyOrdersConfirmed(orders, claimed.userId);

    return { success: true, orders };
  }

  listForCustomer(
    userId: string,
    tab: 'active' | 'previous' | 'canceled' | undefined,
    page: number,
    limit: number,
  ): Promise<{ data: Order[]; total: number }> {
    return this.orderRepository.findManyWithPagination({
      page,
      limit,
      customerId: userId,
      status: tab ? TAB_STATUSES[tab] : undefined,
    });
  }

  async getForCustomerOrThrow(userId: string, orderId: string): Promise<Order> {
    const order = await this.getOrThrow(orderId);
    // 404 (not 403) for cross-user access — same precedent as
    // AddressesService/ProductsService.
    if (order.customerId !== userId) {
      throw new AppException(
        ERROR_CODES.ORDER_NOT_FOUND,
        'Order not found',
        404,
      );
    }
    return order;
  }

  async getInvoiceForCustomer(
    userId: string,
    orderId: string,
  ): Promise<OrderInvoice> {
    const order = await this.getForCustomerOrThrow(userId, orderId);
    const [vendor, user] = await Promise.all([
      this.vendorsService.findById(order.storeId),
      this.usersService.findById(userId),
    ]);
    // Object.assign onto `new Order()` (not a `{...order}` spread) keeps
    // the result a real Order instance — matters if a future field ever
    // needs @Exclude() and depends on ClassSerializerInterceptor recognizing
    // the prototype (see CartService.withTotals for the same precaution).
    return Object.assign(new Order(), order, {
      storeName: vendor?.storeName ?? '',
      customerName: user ? `${user.firstName} ${user.lastName}`.trim() : '',
      customerEmail: user?.email,
    });
  }

  async cancelForCustomer(
    userId: string,
    orderId: string,
    dto: CancelOrderDto,
  ): Promise<Order> {
    const order = await this.getForCustomerOrThrow(userId, orderId);
    if (!CANCELLABLE_STATUSES.includes(order.status as OrderStatus)) {
      throw new AppException(
        ERROR_CODES.ORDER_NOT_CANCELLABLE,
        `Cannot cancel an order that is already ${order.status}`,
        422,
      );
    }

    const statusHistory = [
      ...order.statusHistory,
      { status: 'cancelled', note: dto.note, timestamp: new Date() },
    ];
    const updated = await this.orderRepository.update(orderId, {
      status: 'cancelled',
      statusHistory,
    });
    if (updated) {
      void this.notifyOrderCancelled(updated);
    }
    return updated as Order;
  }

  listForVendor(
    vendorId: string,
    status: OrderStatus | undefined,
    page: number,
    limit: number,
  ): Promise<{ data: Order[]; total: number }> {
    return this.orderRepository.findManyWithPagination({
      page,
      limit,
      storeId: vendorId,
      status: status ? [status] : undefined,
    });
  }

  async getForVendorOrThrow(vendorId: string, orderId: string): Promise<Order> {
    const order = await this.getOrThrow(orderId);
    if (order.storeId !== vendorId) {
      throw new AppException(
        ERROR_CODES.ORDER_NOT_FOUND,
        'Order not found',
        404,
      );
    }
    return order;
  }

  async updateStatusByVendor(
    vendorId: string,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.getForVendorOrThrow(vendorId, orderId);

    // Resending the order's *current* status is treated as a driver-info-only
    // update (see UpdateOrderStatusDto) rather than an illegal transition.
    const isDriverOnlyUpdate = dto.status === order.status;
    if (!isDriverOnlyUpdate) {
      const allowedTargets =
        VENDOR_ALLOWED_TRANSITIONS[order.status as OrderStatus];
      if (!allowedTargets.includes(dto.status)) {
        throw new AppException(
          ERROR_CODES.ORDER_STATUS_TRANSITION_INVALID,
          `Cannot move an order from ${order.status} to ${dto.status}`,
          422,
          [
            {
              field: 'status',
              message: `Cannot move an order from ${order.status} to ${dto.status}`,
            },
          ],
        );
      }
    }

    const statusHistory = isDriverOnlyUpdate
      ? order.statusHistory
      : [
          ...order.statusHistory,
          { status: dto.status, note: dto.note, timestamp: new Date() },
        ];
    const driver = dto.driver
      ? {
          name: dto.driver.name,
          phone: dto.driver.phone,
          photoUrl: dto.driver.photoUrl,
          vehicleInfo: dto.driver.vehicleInfo,
        }
      : order.driver;

    const updated = await this.orderRepository.update(orderId, {
      status: dto.status,
      statusHistory,
      driver,
    });
    if (!isDriverOnlyUpdate && updated) {
      this.notifyOrderStatusChanged(updated);
    }
    return updated as Order;
  }

  listForAdmin(filters: {
    status?: OrderStatus;
    vendorId?: string;
    page: number;
    limit: number;
  }): Promise<{ data: Order[]; total: number }> {
    return this.orderRepository.findManyWithPagination({
      page: filters.page,
      limit: filters.limit,
      storeId: filters.vendorId,
      status: filters.status ? [filters.status] : undefined,
    });
  }

  getForAdminOrThrow(orderId: string): Promise<Order> {
    return this.getOrThrow(orderId);
  }

  private async buildOrderDrafts(
    cartItems: {
      productId: string;
      size?: string;
      color?: string;
      qty: number;
    }[],
  ): Promise<CheckoutOrderDraft[]> {
    const products = await this.productsService.findManyByIds(
      cartItems.map((item) => item.productId),
    );
    const productById = new Map(products.map((p) => [p.id, p]));
    const deliveryFee = this.configService.getOrThrow('cart.deliveryFee', {
      infer: true,
    });
    // One platform-wide rate for every vendor on this checkout — fetched
    // once, not per vendor (see CommissionService.getPercentage).
    const commissionPercent = await this.commissionService.getPercentage();

    const draftsByVendor = new Map<string, CheckoutOrderDraft>();

    for (const item of cartItems) {
      // Re-validate + re-price from the live product — never trust the
      // cart's snapshot at this point (see Cart module notes on unitPrice).
      const product = productById.get(item.productId);
      if (!product || product.status !== 'active') {
        throw new AppException(
          ERROR_CODES.PRODUCT_NOT_FOUND,
          'One or more products in your cart are no longer available',
          404,
        );
      }
      if (!product.inStock) {
        throw new AppException(
          ERROR_CODES.PRODUCT_NOT_AVAILABLE,
          `${product.name.en} is out of stock`,
          422,
        );
      }

      let draft = draftsByVendor.get(product.vendorId);
      if (!draft) {
        draft = {
          storeId: product.vendorId,
          items: [],
          subtotal: 0,
          deliveryFee,
          total: 0,
          commissionPercentSnapshot: commissionPercent,
        };
        draftsByVendor.set(product.vendorId, draft);
      }

      draft.items.push({
        productId: product.id,
        name: { en: product.name.en, ar: product.name.ar },
        size: item.size,
        color: item.color,
        qty: item.qty,
        unitPrice: product.price,
      });
    }

    return Array.from(draftsByVendor.values()).map((draft) => {
      const subtotal = draft.items.reduce(
        (sum, item) => sum + item.unitPrice * item.qty,
        0,
      );
      return { ...draft, subtotal, total: subtotal + draft.deliveryFee };
    });
  }

  private generateOrderNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `ORD-${datePart}-${randomPart}`;
  }

  // Best-effort, same precedent as EmailService — a notification failure
  // must never surface as a checkout/status-update/cancel failure, since the
  // Order write it follows has already succeeded.
  private async notifyOrdersConfirmed(
    orders: Order[],
    customerId: string,
  ): Promise<void> {
    try {
      for (const order of orders) {
        await this.notificationsService.notify(customerId, {
          type: 'order_update',
          title: 'Order confirmed',
          titleAr: 'تم تأكيد الطلب',
          body: `Your order ${order.orderNumber} has been confirmed.`,
          bodyAr: `تم تأكيد طلبك ${order.orderNumber}.`,
          data: { orderId: order.id },
        });

        const vendor = await this.vendorsService.findById(order.storeId);
        if (vendor) {
          await this.notificationsService.notify(vendor.userId, {
            type: 'new_order',
            title: 'New order received',
            titleAr: 'طلب جديد',
            body: `You have a new order ${order.orderNumber} (${order.total.toFixed(2)}).`,
            bodyAr: `لديك طلب جديد ${order.orderNumber} (${order.total.toFixed(2)}).`,
            data: { orderId: order.id },
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to send order-confirmed notifications: ${(error as Error).message}`,
      );
    }
  }

  private notifyOrderStatusChanged(order: Order): void {
    this.notificationsService
      .notify(order.customerId, {
        type: 'order_update',
        title: 'Order status updated',
        titleAr: 'تم تحديث حالة الطلب',
        body: `Your order ${order.orderNumber} is now ${order.status}.`,
        bodyAr: `طلبك ${order.orderNumber} أصبح الآن ${order.status}.`,
        data: { orderId: order.id },
      })
      .catch((error: Error) =>
        this.logger.error(
          `Failed to send order-status notification: ${error.message}`,
        ),
      );
  }

  private async notifyOrderCancelled(order: Order): Promise<void> {
    try {
      const vendor = await this.vendorsService.findById(order.storeId);
      if (!vendor) return;
      await this.notificationsService.notify(vendor.userId, {
        type: 'order_update',
        title: 'Order cancelled',
        titleAr: 'تم إلغاء الطلب',
        body: `Order ${order.orderNumber} was cancelled by the customer.`,
        bodyAr: `تم إلغاء الطلب ${order.orderNumber} من قبل العميل.`,
        data: { orderId: order.id },
      });
    } catch (error) {
      this.logger.error(
        `Failed to send order-cancelled notification: ${(error as Error).message}`,
      );
    }
  }

  private async getOrThrow(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new AppException(
        ERROR_CODES.ORDER_NOT_FOUND,
        'Order not found',
        404,
      );
    }
    return order;
  }
}
