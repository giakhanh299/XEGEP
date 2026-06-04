import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getSharedRideGroups, getSharedRideSummary } from '@/lib/services/shared-rides';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
  }

  const groups = await getSharedRideGroups({ role: session.role, userId: session.userId });
  const summary = await getSharedRideSummary({ role: session.role, userId: session.userId });
  return NextResponse.json({ groups, summary });
}
