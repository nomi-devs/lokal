import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

// Step 1 of vendor registration: send an OTP to the given email. See
// VerifyVendorRegistrationDto for step 2 (verifies the OTP, creates the
// account) — same shape, plus `otp`.
export class RegisterVendorDto {
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Phone must be in E.164 format, e.g. +96500000000',
  })
  phone: string;

  @IsString()
  @Length(2, 50)
  firstName: string;

  @IsString()
  @Length(2, 50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 128)
  password: string;

  @IsString()
  @Length(2, 100)
  storeName: string;

  @IsOptional()
  @IsString()
  storeDescription?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  businessLicense?: string;

  // Public URL returned by POST /vendors/kyc-upload-url after the client PUTs
  // the file to S3 — see files/infrastructure/uploader/s3-presigned. Required:
  // KYC is mandatory to register as a vendor.
  @IsString()
  kycDocumentUrl: string;
}
