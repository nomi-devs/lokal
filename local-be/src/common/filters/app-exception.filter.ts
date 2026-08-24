import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { AppException, AppExceptionDetail } from '../exceptions/app.exception';
import { ERROR_CODES } from '../exceptions/error-codes';
import { statusToBilingual } from '../constants/messages.constant';

interface ValidationExceptionBody {
  message?: string | string[];
}

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message, details } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} ${code}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const messageAr = statusToBilingual(status).ar;

    response.status(status).json({
      success: false,
      error: { code, message, details },
      messageAr,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: randomUUID(),
    });
  }

  private resolve(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details?: AppExceptionDetail[];
  } {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof BadRequestException) {
      const body = exception.getResponse() as ValidationExceptionBody | string;
      const rawMessage = typeof body === 'object' ? body.message : body;
      const messages: string[] = Array.isArray(rawMessage)
        ? rawMessage
        : [String(rawMessage)];
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: messages.map((m) => ({
          field: this.fieldFromMessage(m),
          message: m,
        })),
      };
    }

    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        code: this.codeFromStatus(exception.getStatus()),
        message: exception.message,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'Internal server error. Please try again.',
    };
  }

  private fieldFromMessage(message: string): string {
    const firstWord = message.split(' ')[0];
    return firstWord || 'unknown';
  }

  private codeFromStatus(status: number): string {
    const byStatus: Record<number, string> = {
      [HttpStatus.UNAUTHORIZED]: ERROR_CODES.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ERROR_CODES.FORBIDDEN,
      [HttpStatus.TOO_MANY_REQUESTS]: ERROR_CODES.OTP_REQUEST_RATE_LIMIT,
    };
    return byStatus[status] ?? ERROR_CODES.INTERNAL_ERROR;
  }
}
