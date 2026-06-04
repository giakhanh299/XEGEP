import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getLatestBookingStatusLabel } from '@/lib/booking-history';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getCustomerDashboardBookings } from '@/lib/services/rides';

export default async function CustomerTripsPage() {
  const session = await getSessionFromCookies();
  const bookings = session?.role === 'customer' ? await getCustomerDashboardBookings(session.userId) : [];

  return (
    <SectionCard title="My trips" description="Recent and active shared rides.">
      <div className="space-y-3">
        {bookings.length === 0 ? <p className="text-sm text-slate-300">No bookings yet.</p> : null}
        {bookings.map((booking) => {
          const latestUpdate = getLatestBookingStatusLabel(booking);

          return (
            <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                <p className="font-semibold text-white">
                  {booking.pickupLocation} to {booking.dropoffLocation}
                </p>
                <p className="text-sm text-slate-400">{booking.bookingTime ?? booking.createdAt}</p>
                <p className="text-xs text-slate-500">
                  Estimated fare: {booking.estimatedFare ? `${booking.estimatedFare.toLocaleString()} VND` : 'N/A'}
                </p>
              </div>
                <StatusBadge status={booking.status} />
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                <p>
                  <strong className="text-white">Phone:</strong> {booking.phone}
                </p>
                <p>
                  <strong className="text-white">Driver:</strong> {booking.driverSnapshot?.driverName ?? 'Pending assignment'}
                </p>
                <p className="sm:col-span-2">
                  <strong className="text-white">Latest update:</strong> {latestUpdate.status} at {latestUpdate.timestamp}
                </p>
              </div>
              <Link href={`/customer/my-trips/${booking.id}`} className="mt-4 inline-flex text-sm font-semibold text-emerald-300">
                View trip details
              </Link>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
