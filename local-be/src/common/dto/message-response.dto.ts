import { ApiProperty } from '@nestjs/swagger';

// Reusable Swagger response shape for the many endpoints that only return
// { success, message } — avoids a one-off DTO class per such endpoint.
export class MessageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Done' })
  message: string;
}
