import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AppException } from '../exceptions/app.exception';
import { ERROR_CODES } from '../exceptions/error-codes';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { Role } from '../constants/auth.constants';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

type RequestWithUser = Request & { user?: AuthenticatedUser };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = context.switchToHttp().getRequest<RequestWithUser>().user;
    if (!user || !requiredRoles.includes(user.role)) {
      throw new AppException(
        ERROR_CODES.FORBIDDEN,
        `This action requires one of the following roles: ${requiredRoles.join(', ')}`,
        403,
      );
    }

    return true;
  }
}
