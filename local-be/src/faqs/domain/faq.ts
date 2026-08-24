import { ApiProperty } from '@nestjs/swagger';

export class Faq {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  questionEn: string;

  @ApiProperty()
  questionAr: string;

  @ApiProperty()
  answerEn: string;

  @ApiProperty()
  answerAr: string;

  @ApiProperty({ default: 0 })
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
