import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { DeviceInfoDto } from '../../common/dto/device-info.dto';

export class ResetPasswordDto {
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
  newPassword: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;
}
