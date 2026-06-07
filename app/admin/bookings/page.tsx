import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { AdminActionButton } from '@/components/admin/action-buttons';
import { getLatestBookingStatusLabel } from '@/lib/booking-history';
import { formatBookingStatus } from '@/lib/display-labels';
import { listBookings } from '@/lib/services/rides';

const bookingStatuses = ['confirmed', 'matching', 'driver_assigned', 'on_the_way', 'completed', 'cancelled'] as const;

export default async function AdminBookingsPage() {
  const bookings = await listBookings();

  return (
    <SectionCard title="Chuyến đi" description="Xem và cập nhật trạng thái chuyến đi.">
      <div className="space-y-3">
        {bookings.map((booking) => {
          const latestUpdate = getLatestBookingStatusLabel(booking);

          return (
            <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{booking.customerName}</p>
                  <p className="text-sm text-slate-400">
                    {booking.pickupLocation} → {booking.dropoffLocation}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Cập nhật gần nhất: {formatBookingStatus(latestUpdate.status)}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {bookingStatuses.map((status) => (
                  <AdminActionButton
                    key={status}
                    label={formatBookingStatus(status)}
                    endpoint={`/api/admin/bookings/${booking.id}`}
                    payload={{ status }}
                  />
                ))}
                <Link
                  href={`/admin/bookings/${booking.id}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
