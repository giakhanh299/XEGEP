import { NextResponse } from 'next/server';
import { recordAuditLog } from '@/lib/audit/logs';
import { requireAdminApiSession } from '@/lib/auth/admin';
import { getBooking, updateBookingStatus } from '@/lib/services/rides';
import { validateBookingStatus } from '@/lib/validation';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const booking = await getBooking(id);

  if (!booking) {
    return NextResponse.json({ error: 'Không tìm thấy chuyến đi' }, { status: 404 });
  }

  if (body.status !== undefined) {
    const status = String(body.status ?? '');
    if (!validateBookingStatus(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    const updated = await updateBookingStatus(id, status, { userId: session.userId, role: session.role });

    recordAuditLog({
      actorRole: 'admin',
      actorId: session.userId,
      action: 'booking.status_updated',
      entityType: 'booking',
      entityId: id,
      metadata: body
    });

    return NextResponse.json({ booking: updated });
  }

  return NextResponse.json({ error: 'Chưa cung cấp trạng thái chuyến đi' }, { status: 400 });
}
