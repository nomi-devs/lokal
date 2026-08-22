import { IsIn, IsString } from 'class-validator';

export class RejectVendorDto {
  @IsString()
  rejectionReason: string;

  @IsIn(['expired', 'invalid', 'incomplete', 'fraud'])
  rejectionCategory: string;
}
