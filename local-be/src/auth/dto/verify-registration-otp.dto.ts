import { Type } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { DeviceInfoDto } from '../../common/dto/device-info.dto';

// Step 2 of mobile registration: verifies the OTP from MobileRegisterDto and
// sets the account's password in the same call — from here on the customer
// logs in with phone + password (see MobileLoginDto), no more OTP.
export class VerifyRegistrationOtpDto {
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Phone must be in E.164 format, e.g. +96500000000',
  })
  phone: string;

  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'otp must contain only digits' })
  otp: string;

  @IsString()
  @Length(8, 128)
  password: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;

  @IsOptional()
  @IsString()
  fcmToken?: string;

  @IsOptional()
  @IsIn(['ios', 'android'])
  device?: 'ios' | 'android';
}
