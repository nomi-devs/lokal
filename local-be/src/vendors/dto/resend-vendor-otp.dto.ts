import { IsEmail } from 'class-validator';

// Re-sends the OTP for an in-progress vendor registration — lighter than
// RegisterVendorDto since the rest of the form is already known to the
// client at this point and doesn't need re-validating here.
export class ResendVendorOtpDto {
  @IsEmail()
  email: string;
}
