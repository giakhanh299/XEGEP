import { NextResponse } from 'next/server';
import { recordAuditLog } from '@/lib/audit/logs';
import { updateTrip } from '@/lib/services/fleet';
import { requireAdminApiSession } from '@/lib/auth/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const success = await updateTrip(id, body);

  if (!success) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  recordAuditLog({
    actorRole: 'admin',
    actorId: null,
    action: 'trip.updated',
    entityType: 'trip',
    entityId: id,
    metadata: body
  });

  return NextResponse.json({ ok: true });
}
