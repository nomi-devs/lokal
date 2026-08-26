import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/domain/product';
import { PaginationDto } from '../../common/dto/pagination-response.dto';

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
