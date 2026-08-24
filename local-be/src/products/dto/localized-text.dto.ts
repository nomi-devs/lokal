import { IsOptional, IsString, Length } from 'class-validator';

// Shared { en, ar? } shape used by Product.name and Product.description.
export class LocalizedTextDto {
  @IsString()
  @Length(1, 500)
  en: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  ar?: string;
}
