import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getDriverDashboardBookings } from '@/lib/services/rides';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'driver') {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
  }

  const bookings = await getDriverDashboardBookings(session.userId);
  return NextResponse.json({ bookings });
}
