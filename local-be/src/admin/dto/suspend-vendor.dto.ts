import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SuspendVendorDto {
  @IsString()
  reason: string;

  // Days; omit for an indefinite suspension.
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;
}
