import { ApiProperty } from '@nestjs/swagger';

export type DiscountType = 'percentage' | 'fixed';

export class PromoCode {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ enum: ['percentage', 'fixed'] })
  discountType: DiscountType;

  @ApiProperty({
    description: 'Percentage (0-100) or a flat KWD amount, per discountType',
  })
  discountValue: number;

  @ApiProperty({ required: false, description: 'Undefined = unlimited' })
  maxUsageCount?: number;

  @ApiProperty({ default: 0 })
  currentUsageCount: number;

  @ApiProperty({
    type: [String],
    description: 'Vendor ids — empty = all vendors',
  })
  applicableVendorIds: string[];

  @ApiProperty({
    type: [String],
    description: 'Category ids — empty = all categories',
  })
  applicableCategoryIds: string[];

  @ApiProperty({ required: false })
  minOrderValue?: number;

  @ApiProperty({ required: false, description: 'Percentage codes only' })
  maxDiscountCap?: number;

  @ApiProperty()
  validFrom: Date;

  @ApiProperty()
  validUntil: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: Date, nullable: true })
  lastUsedAt?: Date;

  @ApiProperty({ type: String })
  createdBy: string;

  @ApiProperty({ type: String, nullable: true })
  updatedBy?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
