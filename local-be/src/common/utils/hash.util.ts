import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

export function hashWithBcrypt(value: string, rounds: number): Promise<string> {
  return bcrypt.hash(value, rounds);
}

export function compareWithBcrypt(
  value: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(value, hash);
}

// Deterministic hash for refresh tokens so a session can be looked up directly
// by its token hash instead of linearly bcrypt-comparing every stored session.
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
