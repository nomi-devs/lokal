import { ApiProperty } from '@nestjs/swagger';

class ErrorDetailDto {
  @ApiProperty()
  field: string;

  @ApiProperty()
  message: string;
}

class ErrorBodyDto {
  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [ErrorDetailDto], required: false })
  details?: ErrorDetailDto[];
}

// Mirrors the envelope AppExceptionFilter (common/filters/app-exception.filter.ts)
// produces for every error response — reused across every controller's @ApiResponse.
export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ type: ErrorBodyDto })
  error: ErrorBodyDto;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  requestId: string;
}
