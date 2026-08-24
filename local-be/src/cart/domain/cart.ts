import { ApiProperty } from '@nestjs/swagger';

export class CartItem {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  productId: string;

  @ApiProperty({ type: String })
  storeId: string;

  @ApiProperty({ type: String, required: false })
  size?: string;

  @ApiProperty({ type: String, required: false })
  color?: string;

  @ApiProperty()
  qty: number;

  // Price snapshot at the time the item was added/updated — re-validated
  // against the live product at checkout (see Module 12), not on every read.
  @ApiProperty()
  unitPrice: number;
}

export class Cart {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: [CartItem] })
  items: CartItem[];

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  deliveryFee: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
