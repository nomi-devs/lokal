import { ApiProperty } from '@nestjs/swagger';

// Reusable page/limit/total shape for paginated list responses — pairs with
// PaginationQueryDto on the request side. Was independently redeclared as an
// identical unexported `class PaginationDto` in ~14 *-response.dto.ts files.
export class PaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}
