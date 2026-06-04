import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getBookingForActor, updateBookingStatus } from '@/lib/services/rides';
import { validateBookingStatus } from '@/lib/validation';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'driver') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const booking = await getBookingForActor(id, { userId: session.userId, role: session.role });
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'driver') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const status = String(body.status ?? '');

  if (!validateBookingStatus(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const booking = await updateBookingStatus(id, status, { userId: session.userId, role: session.role });
  return NextResponse.json({ booking });
}
