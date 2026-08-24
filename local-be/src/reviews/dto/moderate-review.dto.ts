import { IsIn, IsString, Length, ValidateIf } from 'class-validator';

// Mirrors the intent of UpdateVendorStatusDto/AdminUpdateProductDto's
// rejectionReason: required when rejecting, ignored when approving.
export class ModerateReviewDto {
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @ValidateIf((o: ModerateReviewDto) => o.status === 'rejected')
  @IsString()
  @Length(1, 300)
  rejectionReason?: string;
}
