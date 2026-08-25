import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';

export class SendOtpResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  messageAr?: string;

  @ApiProperty({ description: 'Seconds until the OTP expires' })
  expiresIn: number;

  @ApiProperty({
    required: false,
    description:
      'Dev/staging only (never present in production) — the OTP code itself, so testing does not require reading server logs or a real SMS/email.',
  })
  otp?: string;

  @ApiProperty({
    required: false,
    description:
      'Present in every environment, including production, whenever SMS_BASE_URL is configured — the exact SMSBox dispatch URL used, with the password redacted. Note the message body embeds the OTP itself.',
  })
  smsUrl?: string;
}

export class TokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ description: 'Seconds until accessToken expires' })
  expiresIn: number;

  @ApiProperty({ description: 'Seconds until refreshToken expires' })
  refreshExpiresIn: number;
}

// Response shape for verify-otp, the only mobile flow that ends with the
// user logged in.
export class MobileAuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: User })
  user: User;

  @ApiProperty({ type: TokensDto })
  tokens: TokensDto;

  @ApiProperty({
    description:
      'True only right after verify-registration-otp creates the account',
  })
  isNewUser: boolean;
}

class LoginVendorSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  storeName: string;

  @ApiProperty({
    enum: ['pending_approval', 'active', 'suspended', 'inactive'],
  })
  status: string;

  @ApiProperty({ required: false })
  message?: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: User })
  user: User;

  @ApiProperty({ type: TokensDto })
  tokens: TokensDto;

  @ApiProperty({ type: LoginVendorSummaryDto, required: false })
  vendor?: LoginVendorSummaryDto;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  accessToken: string;

  @ApiProperty({ description: 'Seconds until accessToken expires' })
  expiresIn: number;
}

export class MeResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: User })
  user: User;
}
