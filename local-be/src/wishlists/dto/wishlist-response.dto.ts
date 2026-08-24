import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/domain/product';

class WishlistItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: Product, nullable: true })
  product: Product | null;
}

class PaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

export class WishlistListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [WishlistItemDto] })
  data: WishlistItemDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class WishlistItemResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  messageAr?: string;

  @ApiProperty({ type: WishlistItemDto })
  item: WishlistItemDto;
}
