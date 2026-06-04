import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { AdminActionButton } from '@/components/admin/action-buttons';
import { listDrivers, listTrips, listVehicles } from '@/lib/services/fleet';

const tripStatuses = ['ready', 'boarding', 'in_progress', 'completed', 'cancelled'] as const;

export default async function AdminTripsPage() {
  const [trips, drivers, vehicles] = await Promise.all([listTrips(), listDrivers(), listVehicles()]);

  return (
    <SectionCard title="Trips" description="Create, combine, and dispatch trips.">
      <div className="space-y-3">
        {trips.map((trip) => (
          <div key={trip.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{trip.routeLabel ?? trip.routeType}</p>
                <p className="text-sm text-slate-400">
                  Passenger count: {trip.passengerCount} / {trip.maxCapacity}
                </p>
                <p className="text-sm text-slate-400">
                  Driver: {trip.driver ?? trip.driverId ?? 'Unassigned'} | Vehicle: {trip.vehicle ?? trip.vehicleId ?? 'Unassigned'}
                </p>
              </div>
              <StatusBadge status={trip.tripStatus} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {tripStatuses.map((status) => (
                <AdminActionButton
                  key={status}
                  label={status.replace('_', ' ')}
                  endpoint={`/api/admin/trips/${trip.id}`}
                  payload={{ tripStatus: status }}
                />
              ))}
              <Link href={`/admin/trips/${trip.id}/map`} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm font-medium text-white">
                Map
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          Drivers available: {drivers.length}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          Vehicles available: {vehicles.length}
        </div>
      </div>
    </SectionCard>
  );
}
