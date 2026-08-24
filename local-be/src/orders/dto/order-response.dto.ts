import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../domain/order';

export class OrderResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Order })
  order: Order;
}

class PaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

export class OrdersListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Order] })
  data: Order[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
