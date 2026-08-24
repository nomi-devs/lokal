import { Matches } from 'class-validator';

// Single entry point for mobile phone auth — works identically whether the
// phone is new or returning. See verify-mobile-otp.dto.ts for step 2.
export class SendMobileOtpDto {
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Phone must be in E.164 format, e.g. +96500000000',
  })
  phone: string;
}
