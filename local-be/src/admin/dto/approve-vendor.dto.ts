import { IsOptional, IsString } from 'class-validator';

export class ApproveVendorDto {
  @IsOptional()
  @IsString()
  approvalNotes?: string;
}
