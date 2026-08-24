import { ApiProperty } from '@nestjs/swagger';
import { Refund } from '../domain/refund';

// Refund enriched with a thin, read-only snapshot of its order — fetched
// live from OrdersService rather than duplicated into the Refund schema
// (same "derive, don't duplicate" precedent as OrdersService.getInvoiceForCustomer).
export class RefundWithContextDto extends Refund {
  @ApiProperty() orderNumber: string;
  @ApiProperty() orderTotal: number;
  @ApiProperty() customerName: string;
  @ApiProperty() customerEmail?: string;
}

export class RefundResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: RefundWithContextDto })
  refund: RefundWithContextDto;
}

class PaginationDto {
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() total: number;
}

export class RefundsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [RefundWithContextDto] })
  data: RefundWithContextDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
