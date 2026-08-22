import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { DeviceInfoDto } from '../../common/dto/device-info.dto';

// Password-based login used by the dashboard only (vendor + admin).
// identifier accepts either the account's phone or email.
export class LoginDto {
  @IsString()
  identifier: string;

  @IsString()
  password: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;
}
