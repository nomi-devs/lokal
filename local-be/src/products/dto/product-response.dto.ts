import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../domain/product';

export class ProductResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Product })
  product: Product;
}

class PaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

export class ProductsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Product] })
  data: Product[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
