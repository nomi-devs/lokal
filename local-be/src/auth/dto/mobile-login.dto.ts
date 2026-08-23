import { Type } from 'class-transformer';
import { IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { DeviceInfoDto } from '../../common/dto/device-info.dto';

// Password-based login for customers/drivers (mobile app only). No OTP here —
// OTP is only used to verify the phone during registration and for
// forgot-password (see mobile-register.dto.ts / forgot-password.dto.ts).
export class MobileLoginDto {
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Phone must be in E.164 format, e.g. +96500000000',
  })
  phone: string;

  @IsString()
  password: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;
}
