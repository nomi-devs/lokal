import { ApiProperty } from '@nestjs/swagger';
import { Cart } from '../domain/cart';

export class CartResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Cart })
  cart: Cart;
}
