import { NextResponse } from 'next/server';
import { createRideBooking, getCustomerDashboardBookings, getDriverDashboardBookings, listBookings } from '@/lib/services/rides';
import { isRateLimited } from '@/lib/security/rateLimit';
import { getSessionFromCookies } from '@/lib/auth/session';
import { validateNonEmpty, validatePassengerCount, validatePositiveNumber } from '@/lib/validation';
import { logError } from '@/lib/logging/errorLogger';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
  }

  const bookings =
    session.role === 'customer'
      ? await getCustomerDashboardBookings(session.userId)
      : session.role === 'driver'
        ? await getDriverDashboardBookings(session.userId)
        : await listBookings();
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const clientKey = request.headers.get('x-forwarded-for') ?? 'booking-form';

  if (isRateLimited(clientKey, 5, 60_000)) {
    return NextResponse.json({ error: 'Quá nhiều yêu cầu' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const session = await getSessionFromCookies();

    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để tạo chuyến đi' }, { status: 401 });
    }

    if (session.role !== 'customer') {
      return NextResponse.json({ error: 'Chỉ khách hàng mới có thể tạo chuyến đi' }, { status: 403 });
    }

    const estimatedDistanceKm = Number(body.estimatedDistanceKm ?? 0);
    const fareBase = Number(body.fareBase ?? 0);
    const farePerKm = Number(body.farePerKm ?? 0);
    const passengerCount = Number(body.passengerCount ?? 1);

    if (
      !validateNonEmpty(String(body.pickupLocation ?? '')) ||
      !validateNonEmpty(String(body.dropoffLocation ?? '')) ||
      !validatePassengerCount(passengerCount) ||
      !validatePositiveNumber(estimatedDistanceKm) ||
      !validatePositiveNumber(fareBase) ||
      !validatePositiveNumber(farePerKm)
    ) {
      return NextResponse.json({ error: 'Dữ liệu chuyến đi không hợp lệ' }, { status: 400 });
    }

    const booking = await createRideBooking({
      userId: session.userId,
      role: session.role,
      pickupLocation: String(body.pickupLocation ?? ''),
      dropoffLocation: String(body.dropoffLocation ?? ''),
      bookingTime: String(body.bookingTime ?? new Date().toISOString()),
      notes: String(body.notes ?? ''),
      driverId: body.driverId ? String(body.driverId) : null,
      routeType: body.routeType,
      passengerCount,
      estimatedDistanceKm,
      fareBase,
      farePerKm
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    logError(error, 'api/bookings');
    return NextResponse.json({ error: 'Không thể tạo chuyến đi' }, { status: 500 });
  }
}
