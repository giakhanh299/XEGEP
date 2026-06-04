import { NextResponse } from 'next/server';
import { recordAuditLog } from '@/lib/audit/logs';
import { requireAdminApiSession } from '@/lib/auth/admin';
import { listAllDriversAdmin, registerAccount } from '@/lib/services/accounts';
import {
  validateApprovalStatus,
  validateNonEmpty,
  validatePassword,
  validatePhoneNumber,
  validateSeatCount,
  validateUsername
} from '@/lib/validation';

export async function GET() {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  const drivers = await listAllDriversAdmin();
  return NextResponse.json({ drivers });
}

export async function POST(request: Request) {
  const session = await requireAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const approvalStatus = String(body.approvalStatus ?? 'pending');
    const active = body.active === true || String(body.active ?? '').toLowerCase() === 'true';
    const driverName = String(body.driverName ?? body.fullName ?? '').trim();

    if (
      !validateUsername(String(body.username ?? '')) ||
      !validatePassword(String(body.password ?? '')) ||
      !validateNonEmpty(driverName) ||
      !validatePhoneNumber(String(body.phone ?? '')) ||
      !validateNonEmpty(String(body.vehicleType ?? '')) ||
      !validateNonEmpty(String(body.plateNumber ?? '')) ||
      !validateSeatCount(Number(body.seatCount ?? 0)) ||
      !validateNonEmpty(String(body.serviceArea ?? '')) ||
      !validateApprovalStatus(approvalStatus)
    ) {
      return NextResponse.json({ error: 'Dữ liệu tài xế không hợp lệ' }, { status: 400 });
    }

    const bundle = await registerAccount({
      role: 'driver',
      username: String(body.username),
      password: String(body.password),
      fullName: driverName,
      phone: String(body.phone),
      driverName,
      vehicleType: body.vehicleType === '7-seat vehicle' ? '7-seat vehicle' : '4-seat vehicle',
      plateNumber: String(body.plateNumber),
      seatCount: Number(body.seatCount) === 7 ? 7 : 4,
      serviceArea: String(body.serviceArea),
      vehiclePhoto: String(body.vehiclePhoto ?? '').trim() || null,
      driverPhoto: String(body.driverPhoto ?? '').trim() || null,
      description: String(body.description ?? '').trim() || null,
      approvalStatus: approvalStatus as 'pending' | 'approved' | 'rejected',
      active,
      rejectedReason: String(body.rejectedReason ?? '').trim() || null
    });

    recordAuditLog({
      actorRole: 'admin',
      actorId: null,
      action: 'driver.created',
      entityType: 'driver',
      entityId: bundle.driver?.userId ?? bundle.user.id,
      metadata: body
    });

    return NextResponse.json({ driver: bundle.driver ?? null }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể tạo tài xế';
    const status = message.toLowerCase().includes('username already exists') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
