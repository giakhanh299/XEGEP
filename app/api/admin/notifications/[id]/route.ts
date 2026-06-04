import { NextResponse } from 'next/server';
import { requireAdminApiSession } from '@/lib/auth/admin';
import { markNotificationRead } from '@/lib/services/notifications';

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  const { id } = await params;
  const notification = await markNotificationRead(id, { userId: session.userId, role: session.role });
  if (!notification) {
    return NextResponse.json({ error: 'Không tìm thấy thông báo' }, { status: 404 });
  }

  return NextResponse.json({ notification });
}
