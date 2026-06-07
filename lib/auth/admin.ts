import { redirect } from 'next/navigation';
import { getRoleHomePath } from '@/lib/auth/paths';
import { getSessionFromCookies } from '@/lib/auth/session';
import type { UserRole } from '@/lib/types';

export function isAdminRole(role?: UserRole | null) {
  return role === 'admin' || role === 'super_admin';
}

export async function getAdminSession() {
  const session = await getSessionFromCookies();
  if (!isAdminRole(session?.role ?? null)) {
    return null;
  }

  return session;
}

export async function requireAdminSession(redirectTo = '/auth') {
  const rawSession = await getSessionFromCookies();
  if (rawSession && !isAdminRole(rawSession.role)) {
    redirect(getRoleHomePath(rawSession.role));
  }

  const session = rawSession && isAdminRole(rawSession.role) ? rawSession : null;
  if (!session) {
    redirect(redirectTo);
  }

  return session;
}

export async function requireAdminApiSession() {
  const session = await getAdminSession();
  if (!session) {
    return null;
  }

  return session;
}
