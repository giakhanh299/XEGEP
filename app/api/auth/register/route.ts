import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth/session';
import { registerAccount } from '@/lib/services/accounts';
import {
  validateLoginIdentifier,
  validateNonEmpty,
  validatePassword,
  validatePhoneNumber,
  validateSeatCount,
  validateUserRole
} from '@/lib/validation';

function publicUser(user: { id: string; username: string; role: string; createdAt: string }) {
  return {
    id: user.id,
    username: user.username,
    email: user.username,
    role: user.role,
    createdAt: user.createdAt
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = String(body.role ?? '').trim();
    const username = String(body.email ?? body.username ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const phone = String(body.phone ?? '').trim();
    const customerFullName = String(body.fullName ?? '').trim();
    const driverName = String(body.driverName ?? '').trim();

    if (
      !validateUserRole(role) ||
      (role !== 'customer' && role !== 'driver') ||
      !validateLoginIdentifier(username) ||
      !validatePassword(password) ||
      !validatePhoneNumber(phone)
    ) {
      return NextResponse.json({ error: 'Dữ liệu đăng ký không hợp lệ' }, { status: 400 });
    }

    if (role === 'customer') {
      if (!validateNonEmpty(customerFullName)) {
        return NextResponse.json({ error: 'Tên hiển thị của khách hàng là bắt buộc' }, { status: 400 });
      }
    }

    if (role === 'driver') {
      if (
        !validateNonEmpty(driverName) ||
        !validateNonEmpty(String(body.vehicleType ?? '')) ||
        !validateNonEmpty(String(body.plateNumber ?? '')) ||
        !validateSeatCount(Number(body.seatCount ?? 0)) ||
        !validateNonEmpty(String(body.serviceArea ?? ''))
      ) {
        return NextResponse.json({ error: 'Tên tài xế là bắt buộc và phải nhập đủ thông tin xe' }, { status: 400 });
      }
    }

    const bundle = await registerAccount({
      role,
      username,
      password,
      fullName: role === 'driver' ? driverName : customerFullName,
      phone,
      address: String(body.address ?? '').trim(),
      driverName: driverName || undefined,
      vehicleType: body.vehicleType === '7-seat vehicle' ? '7-seat vehicle' : body.vehicleType === '4-seat vehicle' ? '4-seat vehicle' : undefined,
      plateNumber: String(body.plateNumber ?? '').trim() || undefined,
      seatCount: Number(body.seatCount ?? 0) === 7 ? 7 : 4,
      serviceArea: String(body.serviceArea ?? '').trim() || undefined,
      vehiclePhoto: String(body.vehiclePhoto ?? '').trim() || null,
      driverPhoto: String(body.driverPhoto ?? '').trim() || null,
      description: String(body.description ?? '').trim() || null
    });

    const response = NextResponse.json({
      user: publicUser(bundle.user),
      customer: bundle.customer ?? null,
      driver: bundle.driver ?? null
    });

    setSessionCookie(response, {
      userId: bundle.user.id,
      username: bundle.user.username,
      role: bundle.user.role,
      issuedAt: Date.now()
    }, request);

    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Không thể đăng ký' }, { status: 400 });
  }
}
