import { NextResponse } from 'next/server';
import { recordAuditLog } from '@/lib/audit/logs';
import { requireAdminApiSession } from '@/lib/auth/admin';
import {
  archiveDriver,
  listAllDriversAdmin,
  setDriverActiveState,
  setDriverApproval,
  updateDriverProfile
} from '@/lib/services/accounts';
import { validateApprovalStatus, validateNonEmpty, validatePhoneNumber, validateSeatCount } from '@/lib/validation';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  const { id } = await params;
  const drivers = await listAllDriversAdmin();
  const driver = drivers.find((item) => item.userId === id);

  if (!driver) {
    return NextResponse.json({ error: 'Không tìm thấy tài xế' }, { status: 404 });
  }

  return NextResponse.json({ driver });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    let driver;
    const action = String(body.action ?? 'update');

    if (action === 'approve') {
      driver = await setDriverApproval(id, 'approved');
    } else if (action === 'reject') {
      driver = await setDriverApproval(id, 'rejected', String(body.rejectedReason ?? 'Bị từ chối bởi quản trị viên'));
    } else if (action === 'activate') {
      driver = await setDriverActiveState(id, true);
    } else if (action === 'deactivate') {
      driver = await setDriverActiveState(id, false);
    } else if (action === 'archive') {
      driver = await archiveDriver(id);
    } else {
      if (
        !validateNonEmpty(String(body.driverName ?? '')) ||
        !validatePhoneNumber(String(body.phone ?? '')) ||
        !validateNonEmpty(String(body.vehicleType ?? '')) ||
        !validateNonEmpty(String(body.plateNumber ?? '')) ||
        !validateSeatCount(Number(body.seatCount ?? 0)) ||
        !validateNonEmpty(String(body.serviceArea ?? '')) ||
        (body.approvalStatus !== undefined && !validateApprovalStatus(String(body.approvalStatus)))
      ) {
        return NextResponse.json({ error: 'Dữ liệu tài xế không hợp lệ' }, { status: 400 });
      }

      driver = await updateDriverProfile(id, {
        driverName: String(body.driverName),
        fullName: String(body.driverName),
        phone: String(body.phone),
        vehicleType: body.vehicleType === '7-seat vehicle' ? '7-seat vehicle' : '4-seat vehicle',
        plateNumber: String(body.plateNumber),
        seatCount: Number(body.seatCount) === 7 ? 7 : 4,
        serviceArea: String(body.serviceArea),
        approvalStatus: body.approvalStatus,
        rejectedReason: body.rejectedReason !== undefined ? String(body.rejectedReason) : undefined,
        active: body.active === undefined ? undefined : String(body.active).toLowerCase() !== 'false',
        vehiclePhoto: body.vehiclePhoto !== undefined ? String(body.vehiclePhoto) : undefined,
        driverPhoto: body.driverPhoto !== undefined ? String(body.driverPhoto) : undefined,
        description: body.description !== undefined ? String(body.description) : undefined
      });
    }

    recordAuditLog({
      actorRole: 'admin',
      actorId: null,
      action: `driver.${action}`,
      entityType: 'driver',
      entityId: id,
      metadata: body
    });

    return NextResponse.json({ driver });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Không tìm thấy tài xế' }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  const { id } = await params;
  const driver = await archiveDriver(id);

  recordAuditLog({
    actorRole: 'admin',
    actorId: null,
    action: 'driver.archived',
    entityType: 'driver',
    entityId: id,
    metadata: {}
  });

  return NextResponse.json({ driver });
}
