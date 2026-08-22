import { ApiProperty } from '@nestjs/swagger';

export class FileType {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  key: string;

  @ApiProperty({
    type: String,
    example: 'https://bucket.s3.region.amazonaws.com/path/to/file.jpg',
  })
  url: string;

  @ApiProperty({ type: String })
  contentType: string;

  @ApiProperty({ type: String, nullable: true })
  purpose?: string;

  @ApiProperty({ type: String })
  uploadedBy: string;

  @ApiProperty()
  createdAt: Date;
}
