import { redirect } from 'next/navigation';
import { getRoleHomePath } from '@/lib/auth/paths';
import { getSessionFromCookies } from '@/lib/auth/session';
import type { SessionPayload } from '@/lib/auth/session';
import type { UserRole } from '@/lib/types';

export async function requireRole(requiredRole: UserRole): Promise<SessionPayload> {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect('/auth');
  }

  if (session.role !== requiredRole) {
    redirect(getRoleHomePath(session.role));
  }

  return session;
}
