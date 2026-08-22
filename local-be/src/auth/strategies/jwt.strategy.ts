import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { AllConfigType } from '../../config/config.type';
import {
  JwtAccessPayload,
  AuthenticatedUser,
} from '../../common/types/authenticated-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService<AllConfigType>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('auth.jwtSecret', { infer: true }),
    });
  }

  async validate(payload: JwtAccessPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || user.status !== 'active') {
      // Returning null/throwing here is caught by JwtAuthGuard.handleRequest and
      // turned into a 401 — covers "user still active" per every protected request.
      return null as unknown as AuthenticatedUser;
    }
    return { userId: user.id, role: user.role, vendorId: user.vendorId };
  }
}
