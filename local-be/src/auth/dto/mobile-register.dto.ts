import { Matches } from 'class-validator';

// Step 1 of mobile registration: send an OTP to verify phone ownership.
// See verify-registration-otp.dto.ts for step 2 (sets the password).
export class MobileRegisterDto {
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Phone must be in E.164 format, e.g. +96500000000',
  })
  phone: string;
}
