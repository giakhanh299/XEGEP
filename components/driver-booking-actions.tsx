'use client';

import { useRouter } from 'next/navigation';
import { BookingStatus } from '@/lib/types';

const actions: Array<{ label: string; status: BookingStatus }> = [
  { label: 'Nhận chuyến', status: 'accepted' },
  { label: 'Từ chối', status: 'cancelled' },
  { label: 'Hoàn thành', status: 'completed' }
];

export function DriverBookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();

  async function updateBooking(status: BookingStatus) {
    await fetch(`/api/driver/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => updateBooking(action.status)}
          className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm font-medium text-white"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
