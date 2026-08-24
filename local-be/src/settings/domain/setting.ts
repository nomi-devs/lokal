import { ApiProperty } from '@nestjs/swagger';

export type SettingType = 'number' | 'string' | 'boolean' | 'json';
export type SettingCategory =
  'payment' | 'shipping' | 'commission' | 'sms' | 'auth' | 'general';

// A generic key/value config store for admin-tunable values shown on the
// dashboard's Settings page. Deliberately not wired into runtime app
// behavior (env vars via registerAs/*.config.ts remain authoritative there,
// see CLAUDE.md) — this is a visibility/record-keeping surface only.
export class Setting {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty({ type: Object })
  value: string | number | boolean;

  @ApiProperty({ enum: ['number', 'string', 'boolean', 'json'] })
  type: SettingType;

  @ApiProperty({
    enum: ['payment', 'shipping', 'commission', 'sms', 'auth', 'general'],
  })
  category: SettingCategory;

  @ApiProperty()
  descriptionEn: string;

  @ApiProperty({ required: false })
  descriptionAr?: string;

  @ApiProperty({ type: String, nullable: true })
  updatedBy?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
