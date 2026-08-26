import { ApiProperty } from '@nestjs/swagger';

import { PaginationDto } from '../../common/dto/pagination-response.dto';

// A payment "row" is just an Order projected the way the dashboard's
// Payments page wants it — there's no separate Payment collection. Orders
// are only ever created after MyFatoorah confirms payment (see
// OrdersService.finalizeCheckout), so paymentStatus is 'paid' for every row
// today; 'pending'/'failed' are modeled for completeness but currently
// unreachable in this flow.
export class AdminPaymentRowDto {
  @ApiProperty() id: string;
  @ApiProperty() orderId: string;
  @ApiProperty() orderNumber: string;
  @ApiProperty() customerId: string;
  @ApiProperty() customerName: string;
  @ApiProperty({ required: false }) customerEmail?: string;
  @ApiProperty() vendorId: string;
  @ApiProperty() vendorName: string;
  @ApiProperty() amount: number;
  @ApiProperty() paymentMethodType: string;
  @ApiProperty({ enum: ['pending', 'paid', 'failed'] }) paymentStatus: string;
  @ApiProperty() createdAt: Date;
}

export class AdminPaymentsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [AdminPaymentRowDto] })
  data: AdminPaymentRowDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
