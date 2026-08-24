import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/domain/product';
import { Vendor } from '../../vendors/domain/vendor';

class AdminVendorListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  storeName: string;

  @ApiProperty({ required: false })
  ownerName?: string;

  @ApiProperty({ required: false })
  ownerPhone?: string;

  @ApiProperty({ required: false })
  ownerEmail?: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({
    enum: ['pending_approval', 'active', 'suspended', 'inactive'],
  })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({
    required: false,
    description: 'KYC document uploaded at registration',
  })
  kycDocumentUrl?: string;
}

class PaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

export class AdminVendorsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [AdminVendorListItemDto] })
  data: AdminVendorListItemDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class AdminVendorProductsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Product] })
  data: Product[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class AdminVendorDetailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Vendor })
  vendor: Vendor;
}

// One response shape for every status transition (approve/reject/suspend —
// see UpdateVendorStatusDto/VendorsService.updateStatus), instead of a
// separate narrow DTO per transition.
export class UpdateVendorStatusResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  messageAr?: string;

  @ApiProperty({ type: Vendor })
  vendor: Vendor;
}
