import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { StatCard } from '@/components/stat-card';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getDriverDashboardBookings } from '@/lib/services/rides';

export default async function DriverHomePage() {
  const session = await getSessionFromCookies();
  const bookings = session?.role === 'driver' ? await getDriverDashboardBookings(session.userId) : [];
  const activeBookings = bookings.filter((booking) => booking.status !== 'completed' && booking.status !== 'cancelled');

  return (
    <div className="grid gap-4">
      <SectionCard title="Incoming bookings" description="Trips currently in your queue.">
        <div className="space-y-3">
          {bookings.slice(0, 2).map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {booking.pickupLocation} to {booking.dropoffLocation}
                  </p>
                  <p className="text-sm text-slate-400">{booking.bookingTime ?? booking.createdAt}</p>
                  <p className="text-sm text-slate-400">
                    Est. fare: {booking.estimatedFare ? `${booking.estimatedFare.toLocaleString()} VND` : 'N/A'}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  {booking.status}
                </span>
              </div>
              <Link href="/driver/bookings" className="mt-3 inline-flex text-sm font-semibold text-emerald-300">
                Review actions
              </Link>
            </div>
          ))}
          {bookings.length === 0 ? <p className="text-sm text-slate-300">No incoming bookings yet.</p> : null}
        </div>
      </SectionCard>

      <SectionCard title="Live tracking" description="Location sharing controls for the active trip.">
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" className="rounded-2xl bg-emerald-400 px-4 py-4 font-semibold text-slate-950">
            Start Sharing Location
          </button>
          <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 font-semibold text-white">
            Stop Sharing Location
          </button>
        </div>
      </SectionCard>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Bookings" value={String(bookings.length)} detail="Assigned and historical bookings." />
        <StatCard label="Active" value={String(activeBookings.length)} detail="Pending or active trips." />
        <StatCard label="Driver" value={session?.username ?? 'Guest'} detail="Signed-in account." />
      </div>
    </div>
  );
}
