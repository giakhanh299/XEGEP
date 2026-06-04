import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const HASH_ALGORITHM = 'scrypt';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64);
  return `${HASH_ALGORITHM}$${salt}$${derived.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hashed] = storedHash.split('$');
  if (algorithm !== HASH_ALGORITHM || !salt || !hashed) {
    return false;
  }

  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(hashed, 'hex');
  return stored.length === candidate.length && timingSafeEqual(stored, candidate);
}
