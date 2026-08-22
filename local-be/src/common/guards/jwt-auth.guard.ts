import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppException } from '../exceptions/app.exception';
import { ERROR_CODES } from '../exceptions/error-codes';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: unknown, user: any, info: unknown): TUser {
    if (err || !user) {
      const isExpired =
        info instanceof Error && info.name === 'TokenExpiredError';
      throw new AppException(
        isExpired ? ERROR_CODES.TOKEN_EXPIRED : ERROR_CODES.INVALID_TOKEN,
        isExpired
          ? 'Token expired. Use refresh token to get new one.'
          : 'Invalid or expired token. Please login again.',
        401,
      );
    }
    return user as TUser;
  }
}
