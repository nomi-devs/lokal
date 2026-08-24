import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  // Validated against `type` in SettingsService — DTOs only validate
  // shape, not cross-field rules (same split as ProductsService pricing).
  value: string | number | boolean;

  @IsIn(['number', 'string', 'boolean', 'json'])
  type: 'number' | 'string' | 'boolean' | 'json';

  @IsIn(['payment', 'shipping', 'commission', 'sms', 'auth', 'general'])
  category: 'payment' | 'shipping' | 'commission' | 'sms' | 'auth' | 'general';

  @IsString()
  @IsNotEmpty()
  descriptionEn: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;
}
