import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { StatCard } from '@/components/stat-card';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getCustomerDashboardBookings } from '@/lib/services/rides';

export default async function CustomerHomePage() {
  const session = await getSessionFromCookies();
  const bookings = session?.role === 'customer' ? await getCustomerDashboardBookings(session.userId) : [];
  const activeBookings = bookings.filter((booking) => booking.status !== 'completed' && booking.status !== 'cancelled');

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <SectionCard title="Current booking" description="Your latest ride request.">
        <div className="space-y-4">
          {bookings[0] ? (
            <>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  {bookings[0].status}
                </span>
                <span className="text-sm text-slate-400">{bookings[0].bookingTime ?? bookings[0].createdAt}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-200">
                <p>
                  <strong className="text-white">From:</strong> {bookings[0].pickupLocation}
                </p>
                <p>
                  <strong className="text-white">To:</strong> {bookings[0].dropoffLocation}
                </p>
                <p>
                  <strong className="text-white">Driver:</strong> {bookings[0].driverSnapshot?.driverName ?? 'Pending assignment'}
                </p>
                <p>
                  <strong className="text-white">Estimated fare:</strong>{' '}
                  {bookings[0].estimatedFare ? `${bookings[0].estimatedFare.toLocaleString()} VND` : 'N/A'}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-300">No active bookings yet.</p>
          )}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Browse vehicles, review booking history, and keep your profile synced for faster checkout.
          </div>
          <Link href="/customer/book" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
            Book another ride
          </Link>
        </div>
      </SectionCard>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard label="Total Bookings" value={String(bookings.length)} detail="All ride requests in your history." />
          <StatCard label="Active Bookings" value={String(activeBookings.length)} detail="Pending or in-progress trips." />
          <StatCard label="Signed In" value={session?.username ?? 'Guest'} detail="Loaded from your session cookie." />
        </div>
        <SectionCard title="Quick actions" description="Common customer actions.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/vehicles" className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Browse vehicles
            </Link>
            <Link href="/customer/my-trips" className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Review my trips
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
