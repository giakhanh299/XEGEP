'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookingRecord } from '@/lib/types';
import { StatusBadge } from '@/components/status-badge';
import { getLatestBookingStatusLabel } from '@/lib/booking-history';
import { formatBookingStatus } from '@/lib/display-labels';

const actions = [
  { label: 'Nhận chuyến', status: 'accepted' },
  { label: 'Từ chối', status: 'cancelled' },
  { label: 'Hoàn thành', status: 'completed' }
] as const;

export function DriverBookingsBoard({ bookings }: { bookings: BookingRecord[] }) {
  const router = useRouter();

  async function updateBooking(id: string, status: (typeof actions)[number]['status']) {
    await fetch(`/api/driver/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {bookings.length === 0 ? <p className="text-sm text-slate-300">Chưa có chuyến đến.</p> : null}
      {bookings.map((booking) => {
        const latestUpdate = getLatestBookingStatusLabel(booking);

        return (
          <article key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{booking.customerName}</p>
                <p className="text-sm text-slate-400">
                  {booking.pickupLocation} → {booking.dropoffLocation}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <p>
                  <strong className="text-white">Thời gian đặt:</strong> {booking.bookingTime ?? booking.travelDate}
              </p>
              <p>
                <strong className="text-white">Điện thoại:</strong> {booking.phone}
              </p>
              <p className="sm:col-span-2">
                <strong className="text-white">Cập nhật gần nhất:</strong> {formatBookingStatus(latestUpdate.status)} lúc {latestUpdate.timestamp}
              </p>
            </div>
            {booking.notes ? <p className="mt-2 text-sm text-slate-300">{booking.notes}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => updateBooking(booking.id, action.status)}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm font-medium text-white"
                >
                  {action.label}
                </button>
              ))}
              <Link
                href={`/driver/bookings/${booking.id}`}
                className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100"
              >
                Xem chi tiết
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
