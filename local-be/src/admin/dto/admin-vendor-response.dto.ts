import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/domain/product';

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

class ApproveVendorSummaryDto {
  @ApiProperty({
    enum: ['pending_approval', 'active', 'suspended', 'inactive'],
  })
  status: string;

  @ApiProperty()
  approvedAt: Date;
}

export class ApproveVendorResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: ApproveVendorSummaryDto })
  vendor: ApproveVendorSummaryDto;
}

class RejectVendorSummaryDto {
  @ApiProperty({
    enum: ['pending_approval', 'active', 'suspended', 'inactive'],
  })
  status: string;

  @ApiProperty()
  rejectionReason: string;
}

export class RejectVendorResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: RejectVendorSummaryDto })
  vendor: RejectVendorSummaryDto;
}
