import { ApiProperty } from '@nestjs/swagger';
import { Setting } from '../domain/setting';

export class SettingResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Setting })
  setting: Setting;
}

export class SettingsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Setting] })
  data: Setting[];
}
