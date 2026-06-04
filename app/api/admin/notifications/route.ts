import { NextResponse } from 'next/server';
import { requireAdminApiSession } from '@/lib/auth/admin';
import { countUnreadNotifications, listNotifications, markAllNotificationsRead } from '@/lib/services/notifications';

export async function GET() {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const notifications = await listNotifications({ userId: session.userId, role: session.role });
  const unreadCount = await countUnreadNotifications({ userId: session.userId, role: session.role });
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: Request) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  if (String(body.action ?? '') !== 'mark_all_read') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const updated = await markAllNotificationsRead({ userId: session.userId, role: session.role });
  return NextResponse.json({ ok: true, updated });
}
