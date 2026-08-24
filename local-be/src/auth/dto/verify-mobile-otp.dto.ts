import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { DeviceInfoDto } from '../../common/dto/device-info.dto';

// Verifies the OTP from SendMobileOtpDto — creates the account on first use
// (response.isNewUser: true) and logs in on every use after. No password
// anywhere: this is the only way in for the mobile app. Name/email aren't
// collected here — the PDF design has no field for them on this screen, only
// later via the Profile screen (PUT /users/update-profile). FCM registration
// is its own endpoint (POST /users/register-fcm-token) rather than bundled
// in here.
export class VerifyMobileOtpDto {
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Phone must be in E.164 format, e.g. +96500000000',
  })
  phone: string;

  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'otp must contain only digits' })
  otp: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;
}
