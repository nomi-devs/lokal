import { IsBoolean } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsBoolean()
  enabled: boolean;
}
