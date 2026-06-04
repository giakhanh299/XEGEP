import { SectionCard } from '@/components/section-card';
import { DriverBookingsBoard } from '@/components/driver-bookings-board';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getDriverDashboardBookings } from '@/lib/services/rides';
import Link from 'next/link';

export default async function DriverBookingsPage() {
  const session = await getSessionFromCookies();
  const bookings = session?.role === 'driver' ? await getDriverDashboardBookings(session.userId) : [];

  if (!session || session.role !== 'driver') {
    return (
      <SectionCard title="Driver bookings" description="Sign in as a driver to manage incoming bookings.">
        <Link href="/auth" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
          Go to sign in
        </Link>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Driver bookings" description="Accept, reject, or complete assigned rides.">
      <DriverBookingsBoard bookings={bookings} />
    </SectionCard>
  );
}
