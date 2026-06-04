import { NextResponse } from 'next/server';
import { recordAuditLog } from '@/lib/audit/logs';
import { requireAdminApiSession } from '@/lib/auth/admin';
import { getBooking, updateBookingStatus } from '@/lib/services/rides';
import { validateBookingStatus } from '@/lib/validation';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const booking = await getBooking(id);

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (body.status !== undefined) {
    const status = String(body.status ?? '');
    if (!validateBookingStatus(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
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

  return NextResponse.json({ error: 'No booking status provided' }, { status: 400 });
}
