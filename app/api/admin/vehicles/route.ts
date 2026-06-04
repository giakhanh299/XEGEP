import { NextResponse } from 'next/server';
import { recordAuditLog } from '@/lib/audit/logs';
import { createVehicle, listVehicles } from '@/lib/services/fleet';
import { requireAdminApiSession } from '@/lib/auth/admin';

export async function GET() {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  const vehicles = await listVehicles();
  return NextResponse.json({ vehicles });
}

export async function POST(request: Request) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  const body = await request.json();
  const vehicle = await createVehicle({
    ...body,
    capacity: body.capacity === undefined ? undefined : Number(body.capacity),
    active: body.active === undefined ? undefined : String(body.active).toLowerCase() !== 'false',
    vehicleType:
      body.vehicleType === '7-seat vehicle' || body.vehicleType === '7-seat'
        ? '7-seat vehicle'
        : '4-seat vehicle'
  });

  recordAuditLog({
    actorRole: 'admin',
    actorId: null,
    action: 'vehicle.created',
    entityType: 'vehicle',
    entityId: vehicle.id,
    metadata: body
  });

  return NextResponse.json({ vehicle }, { status: 201 });
}
