import { ApiProperty } from '@nestjs/swagger';

export type Department = 'men' | 'women' | 'kids' | 'unisex';

export class Category {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameAr: string;

  @ApiProperty({ type: String, nullable: true })
  descriptionEn?: string;

  @ApiProperty({ type: String, nullable: true })
  descriptionAr?: string;

  @ApiProperty({ type: String, nullable: true })
  imageUrl?: string;

  @ApiProperty({ type: String, nullable: true })
  parentId?: string | null;

  @ApiProperty({ enum: ['men', 'women', 'kids', 'unisex'], default: 'unisex' })
  department: Department;

  @ApiProperty({ default: 0 })
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
