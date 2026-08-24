import { ApiProperty } from '@nestjs/swagger';

class OrderItemName {
  @ApiProperty() en: string;
  @ApiProperty({ required: false }) ar?: string;
}

export class OrderItem {
  @ApiProperty({ type: String })
  productId: string;

  @ApiProperty({ type: OrderItemName })
  name: OrderItemName;

  @ApiProperty({ type: String, required: false })
  size?: string;

  @ApiProperty({ type: String, required: false })
  color?: string;

  @ApiProperty()
  qty: number;

  @ApiProperty()
  unitPrice: number;
}

export class OrderAddressSnapshot {
  @ApiProperty({ enum: ['home', 'office', 'other'] })
  label: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  addressLine: string;
}

export class OrderDriver {
  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ type: String, required: false })
  photoUrl?: string;

  // Free-form so it fits "vehicle plate", "bike #", etc. depending on the
  // vendor's own delivery fleet — not a separate driver/fleet module.
  @ApiProperty({ type: String, required: false })
  vehicleInfo?: string;
}

export class OrderStatusHistoryEntry {
  @ApiProperty({
    enum: ['placed', 'confirmed', 'in_transit', 'delivered', 'cancelled'],
  })
  status: string;

  @ApiProperty({ type: String, required: false })
  note?: string;

  @ApiProperty()
  timestamp: Date;
}

export class Order {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  orderNumber: string;

  @ApiProperty({ type: String })
  customerId: string;

  @ApiProperty({ type: String })
  storeId: string;

  // Traces back to the CheckoutSession this order was created from — lets
  // the MyFatoorah callback recognize (and no-op on) a duplicate redelivery
  // of the same webhook without creating a second order (see
  // OrdersService.finalizeCheckout).
  @ApiProperty({ type: String })
  checkoutSessionId: string;

  @ApiProperty({ type: [OrderItem] })
  items: OrderItem[];

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  deliveryFee: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  commissionPercentSnapshot: number;

  @ApiProperty({ type: OrderAddressSnapshot })
  addressSnapshot: OrderAddressSnapshot;

  @ApiProperty()
  paymentMethodType: string;

  @ApiProperty({ enum: ['pending', 'paid', 'failed'] })
  paymentStatus: string;

  @ApiProperty({
    enum: ['placed', 'confirmed', 'in_transit', 'delivered', 'cancelled'],
  })
  status: string;

  @ApiProperty({ type: [OrderStatusHistoryEntry] })
  statusHistory: OrderStatusHistoryEntry[];

  // Set by the vendor (typically alongside the confirmed -> in_transit
  // transition) via PATCH /vendor/orders/:id/status; visible to the
  // customer on their order detail/tracking view once set.
  @ApiProperty({ type: OrderDriver, required: false, nullable: true })
  driver?: OrderDriver;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
