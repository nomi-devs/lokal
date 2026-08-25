import { ApiProperty } from '@nestjs/swagger';

// Single, platform-wide commission percentage applied to every vendor's
// order at checkout (see OrdersService.buildOrderDrafts). Unlike settings/,
// this is a live config value — changing it changes real checkout math
// immediately, not just a record-keeping display (see CLAUDE.md's Settings
// notes for that contrast).
export class PlatformCommission {
  @ApiProperty()
  percentage: number;

  @ApiProperty({ type: String, nullable: true })
  updatedBy?: string;

  // Nullable — no admin has ever set a rate yet on a fresh DB, in which
  // case CommissionService.getOrDefault() synthesizes this record around
  // DEFAULT_COMMISSION_PERCENTAGE rather than persisting a row nobody chose.
  @ApiProperty({ type: Date, nullable: true })
  updatedAt?: Date;
}
