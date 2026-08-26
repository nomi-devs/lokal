import { AppException } from '../exceptions/app.exception';
import { ErrorCode } from '../exceptions/error-codes';

// Shared by services' private `getOrThrow`-style lookups (e.g.
// BannersService.getOrThrow, OrdersService.getOrThrow) — await a
// repository find, throw a 404 AppException if it came back
// null/undefined, otherwise return it narrowed to T.
export async function findOrThrow<T>(
  lookup: Promise<T | null | undefined>,
  code: ErrorCode,
  message: string,
): Promise<T> {
  const result = await lookup;
  if (!result) {
    throw new AppException(code, message, 404);
  }
  return result;
}
