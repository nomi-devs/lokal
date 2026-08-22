import { IsOptional, IsString, IsUrl } from 'class-validator';

// storeName, status and bankAccount are intentionally excluded: storeName is
// fixed at registration, status is admin-only, bankAccount requires verification.
export class UpdateVendorProfileDto {
  @IsOptional()
  @IsString()
  storeDescription?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
