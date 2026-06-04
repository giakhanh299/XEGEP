import { NextResponse } from 'next/server';
import { recordAuditLog } from '@/lib/audit/logs';
import { createTrip, listTrips } from '@/lib/services/fleet';
import { requireAdminApiSession } from '@/lib/auth/admin';

export async function GET() {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  const trips = await listTrips();
  return NextResponse.json({ trips });
}

export async function POST(request: Request) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  const body = await request.json();
  const trip = await createTrip(body);

  recordAuditLog({
    actorRole: 'admin',
    actorId: null,
    action: 'trip.created',
    entityType: 'trip',
    entityId: trip.id,
    metadata: body
  });

  return NextResponse.json({ trip }, { status: 201 });
}
