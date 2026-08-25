import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import type { VendorStatus } from '../../common/constants/auth.constants';

export class Vendor {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: String })
  storeName: string;

  @ApiProperty({ type: String, nullable: true })
  storeDescription?: string;

  @ApiProperty({ type: String, nullable: true })
  city?: string;

  @ApiProperty({ type: String, nullable: true })
  country?: string;

  @ApiProperty({ type: String, nullable: true })
  address?: string;

  @ApiProperty({ type: String, nullable: true })
  phone?: string;

  @Exclude({ toPlainOnly: true })
  businessLicense?: string;

  @ApiProperty({ type: String, nullable: true })
  logoUrl?: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'KYC document (business license/ID) uploaded at registration',
  })
  kycDocumentUrl?: string;

  @ApiProperty({
    enum: ['pending_approval', 'active', 'suspended', 'inactive'],
  })
  status: VendorStatus;

  @ApiProperty({ type: Date, nullable: true })
  approvedAt?: Date;

  @ApiProperty({ type: String, nullable: true })
  approvedBy?: string;

  @ApiProperty({ type: String, nullable: true })
  approvalNotes?: string;

  @ApiProperty({ type: String, nullable: true })
  rejectionReason?: string;

  @ApiProperty({ type: String, nullable: true })
  rejectionCategory?: string;

  @ApiProperty({ type: String, nullable: true })
  suspendReason?: string;

  @ApiProperty({ type: Date, nullable: true })
  suspendedUntil?: Date;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  totalReviews: number;

  @Exclude({ toPlainOnly: true })
  deletedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
