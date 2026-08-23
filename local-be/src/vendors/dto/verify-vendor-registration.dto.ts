import { IsString, Length, Matches } from 'class-validator';
import { RegisterVendorDto } from './register-vendor.dto';

// Step 2 of vendor registration: verifies the OTP sent by
// POST /vendors/register and creates the account in the same call — same
// payload as RegisterVendorDto, plus the code.
export class VerifyVendorRegistrationDto extends RegisterVendorDto {
  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'otp must contain only digits' })
  otp: string;
}
