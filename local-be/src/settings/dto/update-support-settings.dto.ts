import { IsOptional, IsString } from 'class-validator';

// One PATCH for the whole "Support Information" form on the dashboard
// (see SupportInformationCard.tsx on the frontend) instead of one PATCH per
// field. Still just updates the same underlying Setting rows one at a time
// under the hood (see SettingsService.updateSupport) — this only changes
// what the client has to call, not the storage model. All optional: only
// the fields the form actually changed need to be sent.
export class UpdateSupportSettingsDto {
  @IsOptional()
  @IsString()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  supportPhone?: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  officeAddress?: string;
}
