export class UpdateSettingDto {
  // Type-checked against the setting's own `type` in SettingsService.
  value: string | number | boolean;
}
