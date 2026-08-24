import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

// One endpoint for every vendor status transition an admin makes
// (previously three: approve/reject/suspend) — status picks the transition,
// the rest of the fields are only relevant/validated for their matching status.
export class UpdateVendorStatusDto {
  @IsIn(['active', 'inactive', 'suspended'])
  status: 'active' | 'inactive' | 'suspended';

  // status: 'active' (approve)
  @IsOptional()
  @IsString()
  approvalNotes?: string;

  // status: 'inactive' (reject)
  @ValidateIf((o: UpdateVendorStatusDto) => o.status === 'inactive')
  @IsString()
  rejectionReason?: string;

  @ValidateIf((o: UpdateVendorStatusDto) => o.status === 'inactive')
  @IsIn(['expired', 'invalid', 'incomplete', 'fraud'])
  rejectionCategory?: string;

  // status: 'suspended'
  @ValidateIf((o: UpdateVendorStatusDto) => o.status === 'suspended')
  @IsString()
  suspendReason?: string;

  // Days; omit for an indefinite suspension.
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;
}
