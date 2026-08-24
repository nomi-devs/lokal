import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// userId is intentionally excluded — it's implicit from the authenticated
// customer making the request (see AddressesService.createForUser).
export class CreateAddressDto {
  @IsOptional()
  @IsIn(['home', 'office', 'other'])
  label?: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsString()
  @MinLength(1)
  city: string;

  @IsString()
  @MinLength(1)
  phone: string;

  @IsString()
  @MinLength(1)
  addressLine: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
