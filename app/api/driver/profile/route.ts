import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getDriverByUserId, updateDriverProfile } from '@/lib/services/accounts';
import { validateAvailableSeatCount, validateNonEmpty, validatePhoneNumber, validateSeatCount } from '@/lib/validation';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'driver') {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
  }

  const driver = await getDriverByUserId(session.userId);
  return NextResponse.json({ driver });
}

export async function PUT(request: Request) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'driver') {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
  }

  const body = await request.json();
  if (
    !validateNonEmpty(String(body.driverName ?? '')) ||
    !validatePhoneNumber(String(body.phone ?? '')) ||
    !validateNonEmpty(String(body.vehicleType ?? '')) ||
    !validateNonEmpty(String(body.plateNumber ?? '')) ||
    !validateSeatCount(Number(body.seatCount ?? 0)) ||
    !validateAvailableSeatCount(Number(body.availableSeats ?? body.seatCount ?? 0)) ||
    !validateNonEmpty(String(body.serviceArea ?? ''))
  ) {
    return NextResponse.json({ error: 'Hồ sơ tài xế không hợp lệ' }, { status: 400 });
  }

  const driver = await updateDriverProfile(session.userId, {
    driverName: String(body.driverName),
    fullName: String(body.driverName),
    phone: String(body.phone),
    vehicleType: body.vehicleType === '7-seat vehicle' ? '7-seat vehicle' : '4-seat vehicle',
    plateNumber: String(body.plateNumber),
    seatCount: Number(body.seatCount) === 7 ? 7 : 4,
    availableSeats: Math.min(Number(body.availableSeats ?? body.seatCount), Number(body.seatCount) === 7 ? 7 : 4),
    serviceArea: String(body.serviceArea),
    telegramChatId: String(body.telegramChatId ?? '').trim() || null,
    vehiclePhoto: String(body.vehiclePhoto ?? '').trim() || null,
    driverPhoto: String(body.driverPhoto ?? '').trim() || null,
    description: String(body.description ?? '').trim() || null,
    active: body.active === undefined ? undefined : String(body.active).toLowerCase() !== 'false'
  });

  return NextResponse.json({ driver });
}
