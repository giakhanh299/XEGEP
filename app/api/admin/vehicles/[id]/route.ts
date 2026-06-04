import { NextResponse } from 'next/server';
import { recordAuditLog } from '@/lib/audit/logs';
import { updateVehicle } from '@/lib/services/fleet';
import { requireAdminApiSession } from '@/lib/auth/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const success = await updateVehicle(id, body);

  if (!success) {
    return NextResponse.json({ error: 'Không tìm thấy xe' }, { status: 404 });
  }

  recordAuditLog({
    actorRole: 'admin',
    actorId: null,
    action: 'vehicle.updated',
    entityType: 'vehicle',
    entityId: id,
    metadata: body
  });

  return NextResponse.json({ ok: true });
}
