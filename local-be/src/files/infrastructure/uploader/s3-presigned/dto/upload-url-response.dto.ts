import { ApiProperty } from '@nestjs/swagger';

export class UploadUrlResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: String })
  fileId: string;

  @ApiProperty({
    type: String,
    description: 'PUT the file bytes directly to this URL',
  })
  uploadUrl: string;

  @ApiProperty({
    type: String,
    description: 'Public URL to save on the profile/vendor/etc once uploaded',
  })
  fileUrl: string;

  @ApiProperty({ type: Number, description: 'Seconds until uploadUrl expires' })
  expiresIn: number;
}
