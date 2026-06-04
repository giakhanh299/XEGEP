import { DriverBookingsBoard } from '@/components/driver-bookings-board';
import { SectionCard } from '@/components/section-card';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getDriverDashboardBookings } from '@/lib/services/rides';

export default async function DriverTripsPage() {
  const session = await getSessionFromCookies();
  const bookings = session?.role === 'driver' ? await getDriverDashboardBookings(session.userId) : [];

  return (
    <SectionCard title="Driver workflow" description="Incoming bookings and completion actions.">
      <DriverBookingsBoard bookings={bookings} />
    </SectionCard>
  );
}
