import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

// Admin-created vendors skip the public register/verify-registration OTP
// flow entirely — the admin is trusted to have already confirmed the owner's
// identity, so this creates the account (and Vendor record) in one call.
export class AdminCreateVendorDto {
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
  address?: string;

  // Public URL returned by POST /vendors/kyc-upload-url after the client PUTs
  // the file to S3 — same upload flow as public self-registration. Optional
  // here (unlike RegisterVendorDto's required one): the admin creating this
  // account directly is already vouching for it.
  @IsOptional()
  @IsString()
  kycDocumentUrl?: string;

  @IsOptional()
  @IsIn(['pending_approval', 'active'])
  status?: 'pending_approval' | 'active';
}
