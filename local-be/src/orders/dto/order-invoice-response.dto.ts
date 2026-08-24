import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../domain/order';

class OrderInvoice extends Order {
  @ApiProperty({ type: String })
  storeName: string;

  @ApiProperty({ type: String })
  customerName: string;

  @ApiProperty({ type: String, required: false })
  customerEmail?: string;
}

export class OrderInvoiceResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: OrderInvoice })
  invoice: OrderInvoice;
}
