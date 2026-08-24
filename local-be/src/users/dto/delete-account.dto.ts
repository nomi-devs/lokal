import { IsOptional, IsString } from 'class-validator';

export class DeleteAccountDto {
  // Only checked for vendor/admin users (the only roles with a password set).
  // Customers authenticate via OTP and have nothing to confirm here.
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
