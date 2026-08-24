import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendVendorNotificationDto {
  // Omit to broadcast to every vendor account instead of a single one.
  @IsOptional()
  @IsMongoId()
  vendorId?: string;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleAr?: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  messageAr?: string;
}
