import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((body) => {
        if (body && typeof body === 'object' && 'messageAr' in body) {
          const { messageAr, ...rest } = body as Record<string, unknown>;
          return { success: true, ...rest, messageAr };
        }
        return body;
      }),
    );
  }
}
