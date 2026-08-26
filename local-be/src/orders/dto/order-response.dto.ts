import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../domain/order';
import { PaginationDto } from '../../common/dto/pagination-response.dto';

export class OrderResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Order })
  order: Order;
}

export class OrdersListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Order] })
  data: Order[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
