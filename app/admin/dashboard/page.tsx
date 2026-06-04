import { SectionCard } from '@/components/section-card';
import { StatCard } from '@/components/stat-card';
import { requireAdminSession } from '@/lib/auth/admin';
import { listBookings } from '@/lib/services/rides';
import { listAllDriversAdmin } from '@/lib/services/accounts';
import { listTrips } from '@/lib/services/fleet';

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const [bookings, trips, drivers] = await Promise.all([listBookings(), listTrips(), listAllDriversAdmin()]);

  const activeTrips = trips.filter((trip) => trip.tripStatus !== 'completed' && trip.tripStatus !== 'cancelled');
  const completedTrips = trips.filter((trip) => trip.tripStatus === 'completed');
  const revenue = trips.reduce((sum, trip) => sum + trip.totalRevenue, 0);

  const approvedDrivers = drivers.filter((driver) => driver.approvalStatus === 'approved' && driver.active && !driver.archivedAt);
  const pendingDrivers = drivers.filter((driver) => driver.approvalStatus === 'pending');
  const rejectedDrivers = drivers.filter((driver) => driver.approvalStatus === 'rejected');

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Bookings" value={String(bookings.length)} detail="Live booking count." />
        <StatCard label="Approved Drivers" value={String(approvedDrivers.length)} detail="Visible to customers." />
        <StatCard label="Pending Drivers" value={String(pendingDrivers.length)} detail="Awaiting review." />
        <StatCard label="Rejected Drivers" value={String(rejectedDrivers.length)} detail="Not visible to customers." />
      </div>
      <SectionCard title="Operations" description="Live fleet and booking summary.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            Active trips: {activeTrips.length}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            Completed trips: {completedTrips.length}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            Pending bookings: {bookings.filter((booking) => booking.status === 'pending').length}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
            Revenue: {Math.round(revenue / 1000)}K
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
