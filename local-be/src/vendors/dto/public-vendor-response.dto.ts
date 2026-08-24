import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../domain/vendor';

// Customer-facing "store" shape — deliberately thinner than the full Vendor
// domain (no businessLicense/kycDocumentUrl/approval-workflow/suspension
// fields; those are admin-only, see AdminVendorsController). Mapped from
// Vendor via toPublicVendor() below rather than serializing the domain
// class directly, so a new admin-only field added to Vendor doesn't leak
// here by accident.
export class PublicVendorDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  storeName: string;

  @ApiProperty({ type: String, nullable: true })
  storeDescription?: string;

  @ApiProperty({ type: String, nullable: true })
  logoUrl?: string;

  @ApiProperty({ type: String, nullable: true })
  city?: string;

  @ApiProperty({ type: String, nullable: true })
  country?: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  totalReviews: number;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export function toPublicVendor(vendor: Vendor): PublicVendorDto {
  return {
    id: vendor.id,
    storeName: vendor.storeName,
    storeDescription: vendor.storeDescription,
    logoUrl: vendor.logoUrl,
    city: vendor.city,
    country: vendor.country,
    rating: vendor.rating,
    totalReviews: vendor.totalReviews,
    createdAt: vendor.createdAt,
  };
}

class PublicVendorsPaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

export class PublicVendorResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: PublicVendorDto })
  vendor: PublicVendorDto;
}

export class PublicVendorsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [PublicVendorDto] })
  data: PublicVendorDto[];

  @ApiProperty({ type: PublicVendorsPaginationDto })
  pagination: PublicVendorsPaginationDto;
}
