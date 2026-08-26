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
    // Optional Arabic translation of `message`. When omitted, AppExceptionFilter
    // falls back to a generic per-status Arabic string (statusToBilingual) — pass
    // this when the English message is specific enough that the generic fallback
    // (e.g. "Forbidden" -> "ممنوع") would lose that specificity in Arabic.
    public readonly messageAr?: string,
  ) {
    super({ code, message, details }, status);
  }
}
