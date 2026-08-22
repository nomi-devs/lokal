import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateUploadUrlDto {
  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @Matches(/^image\/(jpeg|jpg|png|webp)$/, {
    message: 'contentType must be one of image/jpeg, image/png, image/webp',
  })
  contentType: string;

  @IsOptional()
  @IsIn(['avatar', 'vendor-logo', 'banner', 'misc'])
  purpose?: string;
}
