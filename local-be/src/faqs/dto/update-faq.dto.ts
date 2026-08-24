import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  questionEn?: string;

  @IsOptional()
  @IsString()
  questionAr?: string;

  @IsOptional()
  @IsString()
  answerEn?: string;

  @IsOptional()
  @IsString()
  answerAr?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
