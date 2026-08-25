import { ApiProperty } from '@nestjs/swagger';

class LocalizedText {
  @ApiProperty() en: string;
  @ApiProperty({ required: false }) ar?: string;
}

export class Product {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  vendorId: string;

  @ApiProperty({ type: String })
  categoryId: string;

  @ApiProperty({ enum: ['male', 'female', 'kids', 'unisex'] })
  gender: string;

  @ApiProperty({ type: LocalizedText })
  name: LocalizedText;

  @ApiProperty({ type: LocalizedText })
  description: LocalizedText;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  price: number;

  @ApiProperty({ required: false })
  compareAtPrice?: number;

  @ApiProperty({ type: [String] })
  sizes: string[];

  @ApiProperty({ type: [String] })
  colors: string[];

  @ApiProperty()
  stock: number;

  @ApiProperty()
  inStock: boolean;

  // No separate approval workflow — new/edited products are live immediately
  // (status: 'active'). Admin can flag one as 'rejected' after the fact if
  // it's inappropriate; vendor toggles 'active'/'inactive' themselves.
  @ApiProperty({ enum: ['active', 'inactive', 'rejected'] })
  status: string;

  @ApiProperty({ type: String, nullable: true })
  rejectionReason?: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  ratingCount: number;

  @ApiProperty()
  salesCount: number;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Not persisted — computed per-request, only on the public GET /products
  // and GET /products/:id endpoints, and only when the caller sent a valid
  // token (see OptionalJwtAuthGuard + ProductsService.listPublic/
  // findPublicOne). Absent entirely for an anonymous caller or any other
  // endpoint (vendor/admin product listings), same convention as
  // compareAtPrice/rejectionReason above.
  @ApiProperty({
    required: false,
    description:
      'Only present on GET /products / GET /products/:id when the caller is authenticated — whether this product is in their wishlist.',
  })
  isWishlisted?: boolean;
}
