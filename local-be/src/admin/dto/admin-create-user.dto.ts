import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

// Admin-created accounts only — vendor is deliberately excluded here since a
// vendor role requires an accompanying Vendor record (storeName etc.); see
// AdminCreateVendorDto/POST /admin/vendors for that.
export class AdminCreateUserDto {
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

  @IsOptional()
  @IsEmail()
  email?: string;

  // Only meaningful for role: 'admin' — customer is the mobile-app, OTP-only
  // role with no password login anywhere, so one is never set for it (see
  // UsersService.createWithPassword).
  @ValidateIf((o: AdminCreateUserDto) => o.role === 'admin')
  @IsString()
  @Length(8, 128)
  password?: string;

  @IsIn(['customer', 'admin'])
  role: 'customer' | 'admin';

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
