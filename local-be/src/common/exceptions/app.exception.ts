import { HttpException } from '@nestjs/common';
import { ErrorCode } from './error-codes';

export interface AppExceptionDetail {
  field: string;
  message: string;
}

export class AppException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    status: number,
    public readonly details?: AppExceptionDetail[],
  ) {
    super({ code, message, details }, status);
  }
}
