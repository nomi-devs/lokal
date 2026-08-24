import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  ValidateIf,
} from 'class-validator';

// Mirrors ModerateReviewDto's shape — see RefundsService.moderate for the
// requested->approved->completed / requested->rejected transition rules.
export class ModerateRefundDto {
  @IsIn(['approved', 'rejected', 'completed'])
  status: 'approved' | 'rejected' | 'completed';

  @ValidateIf((o: ModerateRefundDto) => o.status === 'approved')
  @IsOptional()
  @IsString()
  @Length(1, 500)
  approvalNotes?: string;

  @ValidateIf((o: ModerateRefundDto) => o.status === 'rejected')
  @IsString()
  @Length(1, 500)
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  rejectionCategory?: string;

  @ValidateIf((o: ModerateRefundDto) => o.status === 'completed')
  @IsUrl()
  proofOfTransferUrl?: string;
}
