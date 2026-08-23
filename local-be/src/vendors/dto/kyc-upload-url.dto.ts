import { IsString, Matches, MaxLength } from 'class-validator';

export class KycUploadUrlDto {
  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @Matches(/^(image\/(jpeg|jpg|png|webp)|application\/pdf)$/, {
    message: 'contentType must be an image (jpeg/png/webp) or application/pdf',
  })
  contentType: string;
}
