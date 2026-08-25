import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Like JwtAuthGuard, but never rejects the request: a missing, malformed,
// expired token, or one whose user is gone/inactive (JwtStrategy.validate
// returns null for that last case) just means the request proceeds
// unauthenticated — request.user stays undefined instead of a 401. For
// public browse endpoints that personalize the response *if* the caller
// happens to be logged in (see ProductsController's isWishlisted) without
// requiring auth to use them at all.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(_err: unknown, user: any): TUser {
    return (user || undefined) as TUser;
  }
}
