import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { UserRole } from '@/lib/types';

const SESSION_COOKIE = 'ride_session';

export type SessionPayload = {
  userId: string;
  username: string;
  role: UserRole;
  issuedAt: number;
};

function getSessionSecret() {
  return process.env.AUTH_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'dev-session-secret';
}

function encodePayload(payload: SessionPayload) {
  const json = JSON.stringify(payload);
  return Buffer.from(json).toString('base64url');
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

export function createSessionToken(payload: SessionPayload) {
  const encoded = encodePayload(payload);
  return `${encoded}.${sign(encoded)}`;
}

export function parseSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
    return null;
  }

  try {
    const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
    const payload = JSON.parse(decoded) as SessionPayload;
    if (!payload.userId || !payload.username || !payload.role) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieStore() {
  return cookies();
}

export async function readSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionFromCookies() {
  return parseSessionToken(await readSessionToken());
}

export function createSessionCookieValue(payload: SessionPayload) {
  return createSessionToken(payload);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
