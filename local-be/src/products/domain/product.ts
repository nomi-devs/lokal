import { ApiProperty } from '@nestjs/swagger';

class ProductPrice {
  @ApiProperty() base: number;
  @ApiProperty() currency: string;
  @ApiProperty({ required: false }) compareAt?: number;
}

class ProductRatings {
  @ApiProperty() average: number;
  @ApiProperty() count: number;
}

export class Product {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  vendorId: string;

  @ApiProperty({ type: String, nullable: true })
  categoryId?: string;

  @ApiProperty({ enum: ['men', 'women', 'kids', 'unisex'] })
  department: string;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameAr: string;

  @ApiProperty({ nullable: true })
  descriptionEn?: string;

  @ApiProperty({ nullable: true })
  descriptionAr?: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ type: ProductPrice })
  price: ProductPrice;

  @ApiProperty({ type: [String] })
  sizes: string[];

  @ApiProperty({ type: [String] })
  colors: string[];

  @ApiProperty()
  stock: number;

  @ApiProperty({ enum: ['active', 'inactive', 'out_of_stock'] })
  status: string;

  @ApiProperty({ type: ProductRatings })
  ratings: ProductRatings;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
