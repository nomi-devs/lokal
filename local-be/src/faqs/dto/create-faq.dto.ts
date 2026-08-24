import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateFaqDto {
  @IsString()
  questionEn: string;

  @IsString()
  questionAr: string;

  @IsString()
  answerEn: string;

  @IsString()
  answerAr: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
